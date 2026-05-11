import 'phaser';
import { GameModel } from '../model/GameModel';
import { GameState } from '../model/GameState';
import { BlockView } from '../views/BlockView';
import { ScoreboardView } from '../views/ScoreboardView';
import { StorageService } from '../services/StorageService';

/**
 * GameScene renders the model and translates browser input into the
 * original QuickMaths gameplay actions.
 */
export class GameScene extends Phaser.Scene {
  private model!: GameModel;
  private blockViews = new Map<number, BlockView>();
  private scoreboard!: ScoreboardView;
  private storage!: StorageService;
  private highScore = 0;
  private processedGameOver = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data?: { difficulty?: number }): void {
    this.input.mouse?.disableContextMenu();

    const canvas = this.game.canvas as HTMLCanvasElement;
    canvas.onauxclick = (event) => event.preventDefault();

    this.storage = new StorageService();
    this.highScore = this.storage.getNumber('quickmaths_highscore', 0);

    this.model = new GameModel(data?.difficulty ?? 1.0);
    this.model.highScore = this.highScore;

    this.scoreboard = new ScoreboardView(
      this,
      this.highScore,
      () => this.restartGame(),
      () => this.scene.start('StartScene'),
    );

    this.processedGameOver = false;
  }

  update(_time: number, delta: number): void {
    this.model.update(delta);

    if (this.model.gameState === GameState.GameOver && !this.processedGameOver) {
      this.processGameOver();
    }

    this.syncBlockViews();
    this.scoreboard.updateFromModel(this.model, this.highScore);
  }

  private syncBlockViews(): void {
    for (const block of this.model.blocks) {
      if (this.blockViews.has(block.id)) {
        continue;
      }

      const view = new BlockView(this, block);
      this.blockViews.set(block.id, view);

      view.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pointer.event.preventDefault();

        if (pointer.button === 0) {
          this.model.handleBlockLeftClick(block.id);
        } else if (pointer.button === 1) {
          this.model.handleBlockTargetClick(block.id);
        }
      });
    }

    for (const [id, view] of Array.from(this.blockViews)) {
      const block = this.model.blocks.find((candidate) => candidate.id === id);

      if (!block) {
        view.destroy();
        this.blockViews.delete(id);
        continue;
      }

      view.updateFromModel();
    }
  }

  private processGameOver(): void {
    this.processedGameOver = true;

    this.model.score += this.model.thisScore;
    this.model.thisScore = 0;

    if (this.model.score > this.highScore) {
      this.highScore = this.model.score;
      this.storage.setNumber('quickmaths_highscore', this.highScore);
    }

    this.scoreboard.showGameOverControls();
  }

  private restartGame(): void {
    for (const view of this.blockViews.values()) {
      view.destroy();
    }

    this.blockViews.clear();
    this.model.restart();
    this.processedGameOver = false;
    this.scoreboard.reset();
  }
}
