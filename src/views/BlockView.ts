import 'phaser';
import { BLOCK_SIZE } from '../config/originalConstants';
import { BlockState } from '../model/BlockState';

/**
 * BlockView is responsible for rendering an individual block based on its
 * corresponding model state. It uses a Container to group the sprite
 * and text together. The view does not alter game logic; instead it
 * delegates events to the scene which communicates with the GameModel.
 */
export class BlockView extends Phaser.GameObjects.Container {
  private block: BlockState;
  private sprite: Phaser.GameObjects.Image;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, block: BlockState) {
    super(scene, block.x, block.y);
    this.block = block;
    // Create the block graphic using the placeholder image
    this.sprite = scene.add.image(0, 0, 'placeholder');
    this.sprite.setDisplaySize(BLOCK_SIZE, BLOCK_SIZE);
    // Create the text displaying the block's value
    this.text = scene.add.text(0, 0, String(block.value), {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.text.setOrigin(0.5);
    // Assemble the container
    this.add([this.sprite, this.text]);
    // Enable input on the container; pointer events will be handled
    this.setSize(BLOCK_SIZE, BLOCK_SIZE);
    this.setInteractive(new Phaser.Geom.Rectangle(-BLOCK_SIZE / 2, -BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE), Phaser.Geom.Rectangle.Contains);
    // Register container in the scene
    scene.add.existing(this);
  }

  /**
   * Synchronise the view's position and appearance with the model state.
   * This should be called every frame from the GameScene update.
   */
  updateFromModel(): void {
    this.x = this.block.x;
    this.y = this.block.y;
    // Visual changes for selection and activation
    if (!this.block.active) {
      this.setAlpha(0.4);
    } else if (this.block.selected) {
      this.setAlpha(1);
      this.sprite.setTint(0xff4444);
    } else {
      this.setAlpha(1);
      this.sprite.clearTint();
    }
    this.text.setText(String(this.block.value));
  }

  /**
   * Exposes the underlying model to event handlers.
   */
  getState(): BlockState {
    return this.block;
  }
}
