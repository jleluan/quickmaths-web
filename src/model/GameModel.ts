import {
  BLOCK_SIZE,
  NUM_COLUMNS,
  INITIAL_SPAWN_INTERVAL,
  DEFAULT_INTERVAL_MODIFIER,
  MIN_SPAWN_INTERVAL,
  DEFAULT_FALL_SPEED,
  PER_BLOCK_MULTIPLIER_INCREASE,
  DEFAULT_DIFFICULTY_LEVEL,
  GAME_HEIGHT,
  SCORE_TRANSFER_DELAY_FRAMES,
} from '../config/originalConstants';
import { BlockState } from './BlockState';
import { GameState } from './GameState';
import { getRandomValue } from './randomValue';

/**
 * GameModel encapsulates the core gameplay logic and state. It is agnostic
 * of any rendering or input framework and can therefore be tested in
 * isolation. The Phaser scenes interact with this model to drive the
 * visuals and respond to player input.
 */
export class GameModel {
  /**
   * List of all blocks currently in play. Blocks are appended when
   * spawned and removed when destroyed.
   */
  blocks: BlockState[] = [];
  /**
   * IDs of blocks that the player has selected via left-click. These
   * selections are used to compute the current sum.
   */
  selectedBlocks: number[] = [];
  /** Current score accumulated during this run. */
  score = 0;
  /** Points pending transfer into the main score. When a correct
   * sum is made the reward is accumulated here and then gradually
   * transferred to `score` over subsequent frames, mirroring the
   * original game's m_thisScore behaviour. */
  thisScore = 0;
  /** Number of frames remaining before the next point is moved from
   * thisScore to score. After each transfer this counter is reset
   * back to SCORE_TRANSFER_DELAY_FRAMES. */
  private thisScoreFrames = SCORE_TRANSFER_DELAY_FRAMES;
  /** Multiplier applied when three or more blocks are combined in one sum. */
  multiplier = 1;
  /** Elapsed time in milliseconds since the game started. */
  elapsedTime = 0;
  /** Captures the total time of the game when it ends. Useful for
   * displaying the final time on the scoreboard. */
  lastGameTime = 0;
  /** Tracks the time since the last block spawn. */
  spawnTimer = 0;
  /** The time interval in milliseconds between spawns. */
  spawnInterval = INITIAL_SPAWN_INTERVAL;

  /** Tracks time elapsed since the last interval reduction. Once this
   * exceeds 60 seconds the spawn interval is decreased by
   * DEFAULT_INTERVAL_MODIFIER. */
  private intervalModifyTimer = 0;

  /** Current difficulty multiplier (m_difficultyLevel in C++). */
  private difficulty = DEFAULT_DIFFICULTY_LEVEL;
  /** Current game state. Determines whether updates occur. */
  gameState: GameState = GameState.Ready;
  /** Next unique identifier for a newly spawned block. */
  private nextBlockId = 0;

  /**
   * Bounce animation state. When a block lands on the floor or atop
   * another block a small bounce effect is triggered. bounceActive
   * indicates whether the bounce is currently playing. bounceFrame
   * tracks the current index into bounceValues and bounceYOffset is
   * applied to all views each frame while bouncing. These mirror
   * m_bounce, m_bounceCounter and m_blockdy in the C++ game【385016559686316†L695-L716】.
   */
  bounceActive = false;
  private bounceFrame = 0;
  bounceYOffset = 0;
  private readonly bounceValues = [0, 0, 0, 0, 0, 2, 0, 0, -1, -1, -1, 0, 1, 1, -1];

  /**
   * Holds the positions and values of blocks removed in the last
   * update. When a correct sum is made the selected and target
   * blocks are not destroyed immediately; instead they are flagged
   * for removal. Their positions and values are recorded here so
   * the view can spawn decaying sprites that fall and fade out,
   * mimicking the C++ DecayingBlock effect【385016559686316†L695-L716】.
   */
  private removedBlocks: { x: number; y: number; value: number }[] = [];

  /**
   * Update the game model. This should be called once per frame by
   * the rendering engine, passing the delta time since the last call.
   * @param delta Time in milliseconds since the last update.
   */
  update(delta: number): void {
    if (this.gameState !== GameState.Running) {
      return;
    }
    this.elapsedTime += delta;
    this.spawnTimer += delta;
    this.intervalModifyTimer += delta;

    // Spawn blocks at regular intervals
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this.spawnBlock();
    }

    // Gradually reduce the spawn interval every minute. This increases
    // difficulty by spawning blocks more frequently. A minimum interval
    // prevents the rate from becoming unmanageable. Mirrors the C++
    // behaviour of m_dropModifierTime and m_blockInterval.
    const minute = 60000;
    if (this.intervalModifyTimer >= minute) {
      this.intervalModifyTimer -= minute;
      this.spawnInterval = Math.max(this.spawnInterval - DEFAULT_INTERVAL_MODIFIER, MIN_SPAWN_INTERVAL);
    }

    // Compute floor Y coordinate based on the configured game height. The
    // centre of the block sits BLOCK_SIZE/2 units above the floor.
    const floorCenterY = GAME_HEIGHT - BLOCK_SIZE / 2;
    // Update block positions and handle collisions. We iterate over all
    // active blocks. Falling blocks move downward at their own velocity
    // until they collide with the floor or another landed block. Landed
    // blocks remain stationary. Blocks flagged for removal are skipped.
    for (const block of this.blocks) {
      if (!block.active || block.markedForRemoval) {
        continue;
      }
      if (!block.landed) {
        // Apply velocity
        block.y += block.velocityY * delta;
        // Detect collision with other landed blocks in the same column
        const columnBlocks = this.blocks.filter((b) => b !== block && b.active && b.landed && Math.abs(b.x - block.x) < 0.1);
        let nearestBelow: BlockState | undefined;
        for (const other of columnBlocks) {
          if (!nearestBelow || other.y < nearestBelow.y) {
            nearestBelow = other;
          }
        }
        if (nearestBelow) {
          const targetY = nearestBelow.y - BLOCK_SIZE;
          if (block.y >= targetY) {
            block.y = targetY;
            block.landed = true;
            block.velocityY = 0;
            // Trigger a bounce when the block lands on another
            // block. This sets the bounceActive flag and resets the
            // bounce frame counter so the animation sequence starts
            // from the beginning. Only trigger if the block was
            // previously falling.
            this.bounceActive = true;
            this.bounceFrame = 0;
          }
        } else {
          // No block beneath; check floor
          if (block.y >= floorCenterY) {
            block.y = floorCenterY;
            block.landed = true;
            block.velocityY = 0;
            // Trigger bounce when hitting the floor
            this.bounceActive = true;
            this.bounceFrame = 0;
          }
        }
        // Game over if a landed block touches the top of the playfield
        if (block.landed && block.y - BLOCK_SIZE / 2 <= 0) {
          this.gameState = GameState.GameOver;
        }
      }
    }

    // Remove any blocks that were marked for removal after correct sums.
    // While removing, record their final positions and values for
    // decaying block effects. The view will later consume these to
    // spawn floating numbers that fall and fade. This mirrors the
    // reference implementation's destroyAllMarked() which spawns
    // DecayingBlock instances【385016559686316†L695-L716】.
    if (this.blocks.some((b) => b.markedForRemoval)) {
      const survivors: BlockState[] = [];
      for (const b of this.blocks) {
        if (b.markedForRemoval) {
          // Capture position and value for decaying effect
          this.removedBlocks.push({ x: b.x, y: b.y, value: b.value });
        } else {
          survivors.push(b);
        }
      }
      this.blocks = survivors;
    }

    // Gradually transfer points from thisScore into score. Each frame
    // we decrement thisScoreFrames. When it reaches zero we add one
    // point to the main score and subtract one from thisScore, then
    // reset the delay counter. This replicates the original game's
    // point tallying animation【850230493058219†L805-L817】.
    if (this.thisScore > 0) {
      this.thisScoreFrames--;
      if (this.thisScoreFrames < 0) {
        this.thisScore--;
        this.score++;
        this.thisScoreFrames = SCORE_TRANSFER_DELAY_FRAMES;
      }
    }

    // Update bounce animation. When bounceActive is true the
    // bounceYOffset follows the sequence defined in bounceValues
    // during successive frames. Once the sequence completes the
    // bounce is disabled. If bounce is not active the offset is
    // reset to zero. Bounce offsets are added to block and
    // scoreboard positions by the view layer.
    if (this.bounceActive) {
      // Ensure the index does not exceed the sequence length
      if (this.bounceFrame < this.bounceValues.length) {
        this.bounceYOffset = this.bounceValues[this.bounceFrame];
        this.bounceFrame++;
      }
      if (this.bounceFrame >= this.bounceValues.length) {
        this.bounceActive = false;
        this.bounceFrame = 0;
        this.bounceYOffset = 0;
      }
    } else {
      this.bounceYOffset = 0;
    }
  }

  /**
   * Consume and return the list of removed blocks recorded during the
   * last update. This allows the view to spawn decaying sprites at
   * the positions of removed blocks. After calling this method the
   * internal list is cleared.
   */
  consumeRemovedBlocks(): { x: number; y: number; value: number }[] {
    const list = this.removedBlocks;
    this.removedBlocks = [];
    return list;
  }

  /**
   * Create a new block at a random column above the playfield. Blocks
   * are centred horizontally within their column and initially hidden
   * just above the top of the screen.
   */
  spawnBlock(): void {
    // Choose a random column and position the block centred within it. The
    // x-offset leaves room for a scoreboard on the left side. Columns
    // occupy the full game width evenly in the current implementation.
    const col = Math.floor(Math.random() * NUM_COLUMNS);
    const x = col * BLOCK_SIZE + BLOCK_SIZE / 2;
    // Spawn above the top of the screen so blocks fall into view.
    const y = -BLOCK_SIZE / 2;
    const block: BlockState = {
      id: this.nextBlockId++,
      value: getRandomValue(),
      x,
      y,
      active: true,
      selected: false,
      landed: false,
      velocityY: DEFAULT_FALL_SPEED,
    };
    this.blocks.push(block);
  }

  /**
   * Handle a left-click on a block. Adds the block to the list of
   * selected blocks if it isn't already selected.
   */
  handleBlockLeftClick(blockId: number): void {
    if (this.gameState !== GameState.Running) return;
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block || !block.active) return;
    // Allow selection of any active block regardless of whether it has
    // landed. Prevent selecting the same block twice.
    if (block.selected) return;
    block.selected = true;
    this.selectedBlocks.push(blockId);
    // Update multiplier: more than two selected blocks increases multiplier
    if (this.selectedBlocks.length > 2) {
      this.multiplier += PER_BLOCK_MULTIPLIER_INCREASE;
    } else {
      this.multiplier = 1;
    }
  }

  /**
   * Handle a right-click on a block. Checks whether the sum of the
   * currently selected blocks equals this block's value. If correct,
   * updates the score and deactivates the involved blocks. If wrong,
   * resets selections and multiplier.
   */
  /**
   * Handle a middle-click (target click) on a block. Checks whether the
   * sum of the currently selected blocks equals this block's value. If
   * correct, points are added to thisScore and the involved blocks are
   * marked for removal. If wrong, selections are cleared and the
   * multiplier reset. This mirrors the behaviour of gameplayEquals() in
   * the original C++ implementation【850230493058219†L656-L693】.
   */
  handleBlockTargetClick(blockId: number): void {
    if (this.gameState !== GameState.Running) return;
    const target = this.blocks.find((b) => b.id === blockId);
    if (!target || !target.active) return;
    // Compute the sum of selected block values
    const selectedStates = this.selectedBlocks
      .map((id) => this.blocks.find((b) => b.id === id))
      .filter((b): b is BlockState => !!b);
    const sum = selectedStates.reduce((acc, b) => acc + b.value, 0);
    // If no blocks are selected or target is selected, treat as noop
    if (selectedStates.length === 0 || target.selected) {
      return;
    }
    if (sum === target.value) {
      // Correct answer: award score via thisScore and mark blocks for removal
      // Score increment is (sum + target) multiplied by current multiplier and difficulty
      const total = sum + target.value;
      this.thisScore += Math.ceil(total * this.multiplier * this.difficulty);
      // Mark all selected blocks and the target for removal
      for (const b of selectedStates) {
        b.markedForRemoval = true;
        b.selected = false;
      }
      target.markedForRemoval = true;
    } else {
      // Wrong answer: deselect blocks and reset multiplier
      for (const b of selectedStates) {
        b.selected = false;
      }
    }
    // Reset multiplier to baseline for next sequence
    this.multiplier = 1;
    // Clear selection list
    this.selectedBlocks = [];
  }
}
