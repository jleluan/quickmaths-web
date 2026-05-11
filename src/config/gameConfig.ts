import 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './originalConstants';
import { BootScene } from '../scenes/BootScene';
import { StartScene } from '../scenes/StartScene';
import { InstructionsScene } from '../scenes/InstructionsScene';
import { GameScene } from '../scenes/GameScene';

// Centralised Phaser game configuration. If any dimensions or scene
// ordering changes are required, edit here rather than throughout the code.
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game',
  backgroundColor: '#0a0a0a',
  scene: [BootScene, StartScene, InstructionsScene, GameScene],
};
