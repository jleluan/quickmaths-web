// AudioService encapsulates sound playback. Phaser's sound manager
// requires audio assets to be preloaded in a scene before use. This
// service holds references to those sounds and exposes methods to
// trigger them. Actual sound effects should be ported from the
// original game.

export class AudioService {
  private scene: Phaser.Scene;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  playClick(): void {
    const sound = this.scene.sound.get('click');
    if (sound) sound.play();
  }
  playCorrect(): void {
    const sound = this.scene.sound.get('correct');
    if (sound) sound.play();
  }
  playIncorrect(): void {
    const sound = this.scene.sound.get('incorrect');
    if (sound) sound.play();
  }
}
