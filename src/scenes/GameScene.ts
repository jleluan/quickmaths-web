import 'phaser';
import { GameModel } from '../model/GameModel';
import { GameState } from '../model/GameState';
import { BlockView } from '../views/BlockView';

/**
 * GameScene coordinates the rendering of the game model and handles user
 * interactions. It keeps a mapping from model block IDs to their
 * corresponding views. On each update it advances the model and
 * synchronises the views. Right- and left-click events on blocks
 * propagate to the model via handler methods.
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
    // Start the game
    this.model.gameState = GameState.Running;
  }

  update(time: number, delta: number): void {
    // Advance the game logic
    this.model.update(delta);
    // Synchronise block views with the model
    for (const block of this.model.blocks) {
      // Create a view for any new block
      if (!this.blockViews.has(block.id)) {
        const view = new BlockView(this, block);
        this.blockViews.set(block.id, view);
        // Set up input handlers
        view.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          // Left click (primary button)
          if (pointer.button === 0) {
            this.model.handleBlockLeftClick(block.id);
          }
          // Right click (secondary button)
          else if (pointer.button === 2) {
            this.model.handleBlockRightClick(block.id);
          }
        });
        // Enable right-click events
        view.on('pointerup', (pointer: Phaser.Input.Pointer) => {
          // Prevent context menu from showing
          if (pointer.button === 2) {
            pointer.event.preventDefault();
          }
        });
      }
    }
    // Update existing views and remove inactive ones
    for (const [id, view] of this.blockViews) {
      const block = this.model.blocks.find((b) => b.id === id);
      if (block) {
        view.updateFromModel();
      }
    }
    // Remove views for blocks that are no longer active and have fallen off screen
    for (const [id, view] of Array.from(this.blockViews)) {
      const block = this.model.blocks.find((b) => b.id === id);
      if (!block || (!block.active && block.y > this.cameras.main.height + 100)) {
        view.destroy();
        this.blockViews.delete(id);
      }
    }
  }
}
