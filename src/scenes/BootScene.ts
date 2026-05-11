import 'phaser';

/**
 * BootScene is responsible for preloading core assets such as placeholder
 * images, fonts and audio. Once loading is complete it transitions to
 * the StartScene. Additional assets can be loaded on demand in the
 * GameScene itself.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load a placeholder image for blocks. The actual graphics will be
    // replaced once assets are ported from the C++ version.
    this.load.image('placeholder', 'assets/images/placeholder_block.png');
    // Additional assets such as fonts and audio can be preloaded here.
  }

  create(): void {
    // Immediately proceed to the StartScene once preloading is complete.
    this.scene.start('StartScene');
  }
}
