import 'phaser';
import { gameConfig } from './config/gameConfig';

// Create the Phaser game instance.
// The BootScene will be the first to run and will handle loading assets
// before transitioning to the StartScene.
//
// Phaser automatically injects itself into the global scope via its UMD build,
// so no default export is needed here. The import above ensures that the
// Phaser namespace types are available to TypeScript.

// eslint-disable-next-line no-new
new Phaser.Game(gameConfig);
