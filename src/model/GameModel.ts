import { BLOCK_SIZE, NUM_COLUMNS, INITIAL_SPAWN_INTERVAL } from '../config/originalConstants';
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
  /** Multiplier applied when three or more blocks are combined in one sum. */
  multiplier = 1;
  /** Elapsed time in milliseconds since the game started. */
  elapsedTime = 0;
  /** Tracks the time since the last block spawn. */
  spawnTimer = 0;
  /** The time interval in milliseconds between spawns. */
  spawnInterval = INITIAL_SPAWN_INTERVAL;
  /** Current game state. Determines whether updates occur. */
  gameState: GameState = GameState.Ready;
  /** Next unique identifier for a newly spawned block. */
  private nextBlockId = 0;

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

    // Spawn blocks at regular intervals
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this.spawnBlock();
    }

    // Move blocks downwards. In the C++ version velocity is tied to
    // autoMove and is adjusted by collision rules; here we start with a
    // basic constant fall speed (pixels per ms) until full logic is ported.
    const fallSpeed = 0.1; // placeholder: 0.1 px per ms -> 100 px/s
    for (const block of this.blocks) {
      block.y += delta * fallSpeed;
    }
  }

  /**
   * Create a new block at a random column above the playfield. Blocks
   * are centred horizontally within their column and initially hidden
   * just above the top of the screen.
   */
  spawnBlock(): void {
    const col = Math.floor(Math.random() * NUM_COLUMNS);
    const x = col * BLOCK_SIZE + BLOCK_SIZE / 2;
    const y = -BLOCK_SIZE / 2;
    const block: BlockState = {
      id: this.nextBlockId++,
      value: getRandomValue(),
      x,
      y,
      active: true,
      selected: false,
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
    if (block.selected) return;
    block.selected = true;
    this.selectedBlocks.push(blockId);
  }

  /**
   * Handle a right-click on a block. Checks whether the sum of the
   * currently selected blocks equals this block's value. If correct,
   * updates the score and deactivates the involved blocks. If wrong,
   * resets selections and multiplier.
   */
  handleBlockRightClick(blockId: number): void {
    if (this.gameState !== GameState.Running) return;
    const target = this.blocks.find((b) => b.id === blockId);
    if (!target || !target.active) return;
    // Compute selected sum
    const sum = this.selectedBlocks
      .map((id) => this.blocks.find((b) => b.id === id))
      .filter((b): b is BlockState => !!b)
      .reduce((acc, b) => acc + b.value, 0);
    if (sum === target.value) {
      // Correct answer: mark blocks inactive
      for (const id of this.selectedBlocks) {
        const b = this.blocks.find((blk) => blk.id === id);
        if (b) {
          b.active = false;
          b.selected = false;
        }
      }
      target.active = false;
      // Increase multiplier when more than two blocks are selected
      if (this.selectedBlocks.length >= 3) {
        this.multiplier += 0.5;
      }
      this.score += (sum + target.value) * this.multiplier;
    } else {
      // Wrong answer: reset selections and multiplier
      for (const id of this.selectedBlocks) {
        const b = this.blocks.find((blk) => blk.id === id);
        if (b) {
          b.selected = false;
        }
      }
      this.multiplier = 1;
    }
    this.selectedBlocks = [];
  }
}
