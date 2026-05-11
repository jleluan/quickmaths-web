import 'phaser';

/**
 * StartScene displays the initial menu where players can choose to
 * start the game, view instructions or adjust settings. It currently
 * contains placeholder text. Hook into pointer events to navigate
 * to the GameScene or InstructionsScene.
 */
export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    // Placeholder title text
    this.add.text(width / 2, height / 2 - 80, 'QuickMaths', {
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);
    // Start button
    const startText = this.add.text(width / 2, height / 2, 'Start', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();
    startText.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
    // Instructions button
    const instructionsText = this.add.text(width / 2, height / 2 + 60, 'Instructions', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();
    instructionsText.on('pointerdown', () => {
      this.scene.start('InstructionsScene');
    });
  }
}
