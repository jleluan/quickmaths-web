import 'phaser';
import { BLOCK_SIZE } from '../config/originalConstants';
import { BlockState } from '../model/BlockState';

/**
 * Phaser rendering for a single QuickMaths block.
 *
 * The model owns gameplay. This class only reflects model state visually
 * and exposes a reliable 60x60 pointer hit area.
 */
export class BlockView extends Phaser.GameObjects.Container {
  private readonly block: BlockState;
  private readonly bodyRect: Phaser.GameObjects.Rectangle;
  private readonly valueText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, block: BlockState) {
    super(scene, block.x, block.y);

    this.block = block;

    this.bodyRect = scene.add.rectangle(
      BLOCK_SIZE / 2,
      BLOCK_SIZE / 2,
      BLOCK_SIZE,
      BLOCK_SIZE,
      this.defaultFillColor(),
      1,
    );
    this.bodyRect.setStrokeStyle(1, 0x111111, 0.65);

    this.valueText = scene.add.text(BLOCK_SIZE / 2, BLOCK_SIZE / 2, String(block.value), {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.valueText.setOrigin(0.5);

    this.add([this.bodyRect, this.valueText]);
    this.setSize(BLOCK_SIZE, BLOCK_SIZE);
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, BLOCK_SIZE, BLOCK_SIZE),
      Phaser.Geom.Rectangle.Contains,
    );

    scene.add.existing(this);
    this.updateFromModel();
  }

  updateFromModel(): void {
    this.x = this.block.x;
    this.y = this.block.y;
    this.valueText.setText(String(this.block.value));

    if (this.block.deactivated) {
      this.setAlpha(0.65);
      this.bodyRect.setFillStyle(0x666666, 1);
      this.valueText.setVisible(false);
      return;
    }

    this.valueText.setVisible(true);

    if (this.block.markedForRemoval) {
      this.setAlpha(0.45);
      this.bodyRect.setFillStyle(0xf5f5f5, 1);
      this.valueText.setColor('#111111');
    } else if (this.block.selected) {
      this.setAlpha(1);
      this.bodyRect.setFillStyle(0xf5f5f5, 1);
      this.valueText.setColor('#111111');
    } else {
      this.setAlpha(0.98);
      this.bodyRect.setFillStyle(this.defaultFillColor(), 1);
      this.valueText.setColor('#ffffff');
    }
  }

  private defaultFillColor(): number {
    const red = Math.round((this.block.value / 100) * 255);
    const greenModifier = Math.round((130 - red) / 1.5);
    const green = Math.max(0, Math.min(255, 130 + greenModifier));
    const blue = 255;

    return (red << 16) + (green << 8) + blue;
  }
}
