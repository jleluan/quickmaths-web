import {
  BLOCK_SIZE,
  DEFAULT_BLOCK_INTERVAL,
  DEFAULT_DIFFICULTY_LEVEL,
  DEFAULT_FALL_SPEED,
  DEFAULT_INTERVAL_MODIFIER,
  FLOOR_TOP_Y,
  INITIAL_SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  NUM_COLUMNS,
  PER_BLOCK_MULTIPLIER_INCREASE,
  PLAYFIELD_X,
  POST_LANDING_FALL_SPEED,
  SCORE_TRANSFER_DELAY_FRAMES,
} from '../config/originalConstants';
import { BlockState } from './BlockState';
import { GameState } from './GameState';
import { getRandomValue } from './randomValue';

/**
 * Deterministic gameplay model for QuickMaths.
 *
 * Phaser should render this model, but not own gameplay authority.
 * This deliberately mirrors the original C++ rules:
 * - left click marks/adds any active block, falling or landed
 * - middle click replaces original right click as the target/equal action
 * - selected values are stored until target click
 * - multiplier increases after more than two selected blocks
 * - correct sums add to thisScore, then thisScore tallies into score
 * - blocks can fall again when support underneath is removed
 */
export class GameModel {
  blocks: BlockState[] = [];
  selectedBlocks: number[] = [];

  score = 0;
  highScore = 0;
  thisScore = 0;
  thisScoreFrames = SCORE_TRANSFER_DELAY_FRAMES;

  multiplier = 1;
  difficulty = DEFAULT_DIFFICULTY_LEVEL;

  elapsedTime = 0;
  lastGameTime = 0;

  spawnTimer = 0;
  spawnInterval = INITIAL_SPAWN_INTERVAL;
  private intervalModifyTimer = 0;

  gameState: GameState = GameState.Ready;

  private nextBlockId = 0;

  constructor(difficulty = DEFAULT_DIFFICULTY_LEVEL) {
    this.setDifficultyLevel(difficulty);
    this.restart();
  }

  setDifficultyLevel(difficulty: number): void {
    this.difficulty = difficulty;
    this.spawnInterval = Math.floor(DEFAULT_BLOCK_INTERVAL * (1 + (1 - this.difficulty)));
  }

  restart(): void {
    this.blocks = [];
    this.selectedBlocks = [];
    this.score = 0;
    this.thisScore = 0;
    this.thisScoreFrames = SCORE_TRANSFER_DELAY_FRAMES;
    this.multiplier = 1;
    this.elapsedTime = 0;
    this.lastGameTime = 0;
    this.spawnTimer = 0;
    this.intervalModifyTimer = 0;
    this.nextBlockId = 0;
    this.spawnInterval = Math.floor(DEFAULT_BLOCK_INTERVAL * (1 + (1 - this.difficulty)));
    this.gameState = GameState.Running;
  }

  update(delta: number): void {
    if (this.gameState !== GameState.Running) {
      return;
    }

    this.elapsedTime += delta;
    this.spawnTimer += delta;
    this.intervalModifyTimer += delta;

    this.updateSpawnInterval();
    this.spawnIfNeeded();
    this.updateBlockSupportAndMotion(delta);
    this.removeMarkedBlocks();
    this.tallyScore();
  }

  spawnBlock(): void {
    const column = Math.floor(Math.random() * NUM_COLUMNS);

    this.blocks.unshift({
      id: this.nextBlockId++,
      value: getRandomValue(),
      x: PLAYFIELD_X + column * BLOCK_SIZE,
      y: -BLOCK_SIZE,
      active: true,
      selected: false,
      falling: true,
      hasLanded: false,
      velocityY: DEFAULT_FALL_SPEED,
    });
  }

  /**
   * Original left-click behaviour: any active, unmarked block can be
   * selected. It does not need to have landed.
   */
  handleBlockLeftClick(blockId: number): void {
    if (this.gameState !== GameState.Running) return;

    const block = this.findActiveBlock(blockId);
    if (!block || block.selected || block.markedForRemoval || block.deactivated) {
      return;
    }

    block.selected = true;
    this.selectedBlocks.push(blockId);

    if (this.selectedBlocks.length > 2) {
      this.multiplier += PER_BLOCK_MULTIPLIER_INCREASE * this.difficulty;
    }
  }

  /**
   * Browser replacement for the original right-click action.
   * Middle click picks the target/equal block.
   */
  handleBlockTargetClick(blockId: number): void {
    if (this.gameState !== GameState.Running) return;

    const target = this.findActiveBlock(blockId);
    if (!target || target.markedForRemoval || target.deactivated) {
      return;
    }

    const selectedStates = this.selectedBlocks
      .map((id) => this.findActiveBlock(id))
      .filter((block): block is BlockState => Boolean(block));

    if (selectedStates.length < 2) {
      this.clearSelection();
      return;
    }

    const playerSummed = selectedStates.reduce((sum, block) => sum + block.value, 0);

    if (playerSummed === target.value) {
      const scoredValue = playerSummed + target.value;
      this.thisScore += Math.ceil((scoredValue * this.multiplier) * this.difficulty);

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
   * Backwards-compatible alias while old view code is phased out.
   */
  handleBlockRightClick(blockId: number): void {
    this.handleBlockTargetClick(blockId);
  }

  private updateSpawnInterval(): void {
    if (this.intervalModifyTimer < 60000) {
      return;
    }

    this.intervalModifyTimer = 0;
    this.spawnInterval = Math.max(
      this.spawnInterval - DEFAULT_INTERVAL_MODIFIER,
      MIN_SPAWN_INTERVAL,
    );
  }

  private spawnIfNeeded(): void {
    if (this.spawnTimer < this.spawnInterval) {
      return;
    }

    this.spawnBlock();
    this.spawnTimer = 0;
  }

  private updateBlockSupportAndMotion(delta: number): void {
    for (const block of this.blocks) {
      if (!block.active || block.markedForRemoval || block.deactivated) {
        continue;
      }

      const landingY = this.getLandingY(block);

      if (!block.falling && block.y < landingY - 0.01) {
        block.falling = true;
        block.velocityY = block.hasLanded ? POST_LANDING_FALL_SPEED : DEFAULT_FALL_SPEED;
      }

      if (!block.falling) {
        continue;
      }

      block.y += block.velocityY * delta;

      if (block.y >= landingY) {
        block.y = landingY;
        block.falling = false;
        block.hasLanded = true;
        block.velocityY = 0;

        if (block.y <= 0) {
          this.lastGameTime = this.elapsedTime;
          this.gameState = GameState.GameOver;
        }
      }
    }
  }

  private getLandingY(block: BlockState): number {
    let landingY = FLOOR_TOP_Y - BLOCK_SIZE;

    for (const other of this.blocks) {
      if (
        other === block ||
        !other.active ||
        other.markedForRemoval ||
        other.deactivated ||
        other.x !== block.x ||
        other.y <= block.y
      ) {
        continue;
      }

      landingY = Math.min(landingY, other.y - BLOCK_SIZE);
    }

    return landingY;
  }

  private removeMarkedBlocks(): void {
    if (!this.blocks.some((block) => block.markedForRemoval)) {
      return;
    }

    this.blocks = this.blocks.filter((block) => !block.markedForRemoval);
  }

  /**
   * Match the original score transfer behaviour:
   * wait for SCORE_TRANSFER_DELAY_FRAMES, then move one point per update
   * from thisScore into score until the pending score is empty.
   */
  private tallyScore(): void {
    if (this.thisScore <= 0) {
      this.thisScoreFrames = SCORE_TRANSFER_DELAY_FRAMES;
      return;
    }

    this.thisScoreFrames--;

    if (this.thisScoreFrames < 0) {
      this.thisScore--;
      this.score++;
    }
  }

  private clearSelection(): void {
    for (const id of this.selectedBlocks) {
      const block = this.findActiveBlock(id);
      if (block) {
        block.selected = false;
      }
    }

    this.selectedBlocks = [];
    this.multiplier = 1;
  }

  private findActiveBlock(id: number): BlockState | undefined {
    return this.blocks.find((block) => block.id === id && block.active);
  }
}
