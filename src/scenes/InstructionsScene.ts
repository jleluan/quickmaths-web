import 'phaser';

/**
 * InstructionsScene provides a brief overview of how to play the game.
 */
export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InstructionsScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.text(width / 2, 100, 'How to Play', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const instructions = [
      'Blocks fall from the top of the screen.',
      'Left-click blocks to add their values to your current sum.',
      'Middle-click a block to use it as the target/equal value.',
      'Falling blocks can be selected and used as targets.',
      'Correct sums earn points and increase your multiplier.',
      'An incorrect answer resets your multiplier and selections.',
      'The game ends when blocks stack to the top of the screen.',
    ];

    this.add.text(width / 2, height / 2 - 60, instructions.join('\n'), {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 80 },
    }).setOrigin(0.5);

    const backText = this.add.text(width / 2, height - 80, 'Back', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    backText.on('pointerdown', () => {
      this.scene.start('StartScene');
    });
  }
}
