import 'phaser';
import { BLOCK_SIZE } from '../config/originalConstants';
import { BlockState } from '../model/BlockState';

/**
 * BlockView renders one block based on its model state.
 */
export class BlockView extends Phaser.GameObjects.Container {
  private block: BlockState;
  private sprite: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, block: BlockState) {
    super(scene, block.x, block.y);

    this.block = block;

    this.sprite = scene.add.rectangle(
      0,
      0,
      BLOCK_SIZE,
      BLOCK_SIZE,
      this.getDefaultFillColor(),
      1,
    );
    this.sprite.setStrokeStyle(1, 0x111111, 0.6);

    this.text = scene.add.text(0, 0, String(block.value), {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.text.setOrigin(0.5);

    this.add([this.sprite, this.text]);
    this.setSize(BLOCK_SIZE, BLOCK_SIZE);

    // Use an explicit hit area on the container so clicks are reliable even
    // when the visual rectangle/text does not receive the pointer itself.
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -BLOCK_SIZE / 2,
        -BLOCK_SIZE / 2,
        BLOCK_SIZE,
        BLOCK_SIZE,
      ),
      Phaser.Geom.Rectangle.Contains,
    );

    scene.add.existing(this);
  }

  updateFromModel(): void {
    this.x = this.block.x + BLOCK_SIZE / 2;
    this.y = this.block.y + BLOCK_SIZE / 2;

    this.text.setText(String(this.block.value));

    if (!this.block.active || this.block.markedForRemoval) {
      this.setAlpha(0.35);
      this.sprite.setFillStyle(0x666666, 1);
    } else if (this.block.selected) {
      this.setAlpha(1);
      this.sprite.setFillStyle(0xf5f5f5, 1);
      this.text.setColor('#111111');
    } else {
      this.setAlpha(1);
      this.sprite.setFillStyle(this.getDefaultFillColor(), 1);
      this.text.setColor('#ffffff');
    }
  }

  private getDefaultFillColor(): number {
    const red = Math.round((this.block.value / 100) * 255);
    const greenModifier = Math.round((130 - red) / 1.5);
    const green = 130 + greenModifier;
    const blue = 255;

    return (red << 16) + (green << 8) + blue;
  }
}
