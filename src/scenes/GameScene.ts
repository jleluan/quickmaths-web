import 'phaser';
import { GameModel } from '../model/GameModel';
import { GameState } from '../model/GameState';
import { BlockView } from '../views/BlockView';

/**
 * GameScene coordinates the rendering of the game model and handles user
 * interactions.
 */
export class GameScene extends Phaser.Scene {
  private model: GameModel;
  private blockViews: Map<number, BlockView>;

  constructor() {
    super({ key: 'GameScene' });
    this.model = new GameModel();
    this.blockViews = new Map();
  }

  create(): void {
    this.input.mouse?.disableContextMenu();
    this.model = new GameModel();
    this.blockViews = new Map();
    this.model.gameState = GameState.Running;
  }

  update(_time: number, delta: number): void {
    this.model.update(delta);

    for (const block of this.model.blocks) {
      if (!this.blockViews.has(block.id)) {
        const view = new BlockView(this, block);
        this.blockViews.set(block.id, view);

        view.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          pointer.event.preventDefault();

          // Left click: add/select block value.
          if (pointer.button === 0) {
            this.model.handleBlockLeftClick(block.id);
          }

          // Middle click: target/equal block.
          // This replaces the original right-click control for browser play.
          if (pointer.button === 1) {
            this.model.handleBlockTargetClick(block.id);
          }
        });
      }
    }

    for (const [id, view] of this.blockViews) {
      const block = this.model.blocks.find((b) => b.id === id);

      if (!block) {
        view.destroy();
        this.blockViews.delete(id);
        continue;
      }

      view.updateFromModel();
    }
  }
}
