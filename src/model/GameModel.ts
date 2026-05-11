import {
  BLOCK_SIZE,
  NUM_COLUMNS,
  INITIAL_SPAWN_INTERVAL,
  DEFAULT_INTERVAL_MODIFIER,
  MIN_SPAWN_INTERVAL,
  DEFAULT_FALL_SPEED,
  PER_BLOCK_MULTIPLIER_INCREASE,
  DEFAULT_DIFFICULTY_LEVEL,
  PLAYFIELD_X,
  FLOOR_TOP_Y,
} from '../config/originalConstants';
import { BlockState } from './BlockState';
import { GameState } from './GameState';
import { getRandomValue } from './randomValue';

/**
 * GameModel encapsulates the core gameplay logic and state.
 *
 * Compatibility note:
 * The original C++ game allows both falling and landed blocks to be selected.
 * Selection only checks collision, active state, and whether the block is
 * already marked. Do not restrict selection to landed blocks.
 */
export class GameModel {
  blocks: BlockState[] = [];
  selectedBlocks: number[] = [];

  score = 0;
  pendingScore = 0;
  multiplier = 1;
  elapsedTime = 0;

  spawnTimer = 0;
  spawnInterval = INITIAL_SPAWN_INTERVAL;
  gameState: GameState = GameState.Ready;

  private intervalModifyTimer = 0;
  private difficulty = DEFAULT_DIFFICULTY_LEVEL;
  private nextBlockId = 0;

  update(delta: number): void {
    if (this.gameState !== GameState.Running) {
      return;
    }

    this.elapsedTime += delta;
    this.spawnTimer += delta;
    this.intervalModifyTimer += delta;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this.spawnBlock();
    }

    if (this.intervalModifyTimer >= 60000) {
      this.intervalModifyTimer -= 60000;
      this.spawnInterval = Math.max(
        this.spawnInterval - DEFAULT_INTERVAL_MODIFIER,
        MIN_SPAWN_INTERVAL,
      );
    }

    this.updateFallingBlocks(delta);
    this.removeMarkedBlocks();
  }

  spawnBlock(): void {
    const col = Math.floor(Math.random() * NUM_COLUMNS);
    const x = PLAYFIELD_X + col * BLOCK_SIZE;
    const y = -BLOCK_SIZE;

    const block: BlockState = {
      id: this.nextBlockId++,
      value: getRandomValue(),
      x,
      y,
      active: true,
      selected: false,
      falling: true,
      velocityY: DEFAULT_FALL_SPEED,
    };

    this.blocks.push(block);
  }

  /**
   * Original left click behaviour:
   * - active block
   * - not already marked/selected
   * - falling blocks are valid
   */
  handleBlockLeftClick(blockId: number): void {
    if (this.gameState !== GameState.Running) return;

    const block = this.blocks.find((b) => b.id === blockId);
    if (!block || !block.active || block.selected || block.markedForRemoval) {
      return;
    }

    block.selected = true;
    this.selectedBlocks.push(blockId);

    if (this.selectedBlocks.length > 2) {
      this.multiplier += PER_BLOCK_MULTIPLIER_INCREASE * this.difficulty;
    }
  }

  /**
   * Target/equal click behaviour.
   *
   * In the original game this was right click. In the browser version it is
   * triggered by middle click, but the gameplay rule is the same:
   * choose an active block as the value the selected blocks should equal.
   *
   * Falling blocks are valid targets, matching the original.
   */
  handleBlockTargetClick(blockId: number): void {
    if (this.gameState !== GameState.Running) return;

    const target = this.blocks.find((b) => b.id === blockId);
    if (!target || !target.active || target.markedForRemoval) {
      return;
    }

    const selectedStates = this.selectedBlocks
      .map((id) => this.blocks.find((b) => b.id === id))
      .filter((b): b is BlockState => !!b && b.active);

    if (selectedStates.length < 2 || target.selected) {
      this.clearSelection();
      return;
    }

    const selectedSum = selectedStates.reduce((acc, b) => acc + b.value, 0);

    if (selectedSum === target.value) {
      const scoredTotal = selectedSum + target.value;
      this.pendingScore += Math.ceil(
        scoredTotal * this.multiplier * this.difficulty,
      );

      for (const block of selectedStates) {
        block.markedForRemoval = true;
        block.selected = false;
      }

      target.markedForRemoval = true;
      target.selected = false;
    } else {
      this.clearSelection();
    }

    this.selectedBlocks = [];
    this.multiplier = 1;
  }

  /**
   * Backwards-compatible alias while older scene code is being cleaned up.
   */
  handleBlockRightClick(blockId: number): void {
    this.handleBlockTargetClick(blockId);
  }

  private clearSelection(): void {
    for (const id of this.selectedBlocks) {
      const block = this.blocks.find((b) => b.id === id);
      if (block) {
        block.selected = false;
      }
    }

    this.selectedBlocks = [];
    this.multiplier = 1;
  }

  private updateFallingBlocks(delta: number): void {
    for (const block of this.blocks) {
      if (!block.active || block.markedForRemoval || !block.falling) {
        continue;
      }

      block.y += block.velocityY * delta;

      const floorY = FLOOR_TOP_Y - BLOCK_SIZE;
      let landingY = floorY;

      for (const other of this.blocks) {
        if (
          other === block ||
          !other.active ||
          other.markedForRemoval ||
          other.falling ||
          other.x !== block.x
        ) {
          continue;
        }

        const candidateY = other.y - BLOCK_SIZE;
        if (candidateY < landingY && block.y <= candidateY + BLOCK_SIZE) {
          landingY = candidateY;
        }
      }

      if (block.y >= landingY) {
        block.y = landingY;
        block.falling = false;
        block.velocityY = 0;

        if (block.y <= 0) {
          this.gameState = GameState.GameOver;
        }
      }
    }
  }

  private removeMarkedBlocks(): void {
    if (!this.blocks.some((b) => b.markedForRemoval)) {
      return;
    }

    this.score += this.pendingScore;
    this.pendingScore = 0;
    this.blocks = this.blocks.filter((b) => !b.markedForRemoval);
  }
}
