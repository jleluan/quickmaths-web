// Constants that reflect the original QuickMaths C++ implementation.
// Keep gameplay-tuning values here so the Phaser version remains easy to
// compare against the C++ reference project.

export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 960;

export const BLOCK_SIZE = 60;
export const NUM_COLUMNS = 6;

// Original C++ layout constants.
export const DEFAULT_SCOREBOARD_WIDTH = 270;
export const BORDERS_SIZE = 10;

// Original block spawn positions are:
// BLOCK_SIZE * (rand() % COLUMNS + 3)
// i.e. x = 180, 240, 300, 360, 420, 480.
export const PLAYFIELD_X = BLOCK_SIZE * 3;

// The original floor is positioned at height - 80.
// Blocks stop at FLOOR_TOP_Y - BLOCK_SIZE.
export const FLOOR_TOP_Y = GAME_HEIGHT - 80;

export const DEFAULT_BLOCK_INTERVAL = 2100;
export const INITIAL_SPAWN_INTERVAL = DEFAULT_BLOCK_INTERVAL;

export const DEFAULT_FPS = 100;
export const DEFAULT_INTERVAL_MODIFIER = 100;
export const MIN_SPAWN_INTERVAL = 300;

// Original block velocity is 2 px/frame at 100fps, so approximately 200 px/s.
export const DEFAULT_VELOCITY_PX_PER_FRAME = 2;
export const DEFAULT_FALL_SPEED = (DEFAULT_VELOCITY_PX_PER_FRAME * DEFAULT_FPS) / 1000;

// Original Block::onLanded changes velocity to DEFAULT_VELOCITY * 1.5.
// This matters when blocks begin falling again after support is removed.
export const POST_LANDING_FALL_SPEED = DEFAULT_FALL_SPEED * 1.5;

export const PER_BLOCK_MULTIPLIER_INCREASE = 0.3;
export const DEFAULT_DIFFICULTY_LEVEL = 1;

// Original delay before score starts tallying across from +thisScore.
// DEFAULT_THISSCOREFRAMES = DEFAULT_FPS * 1.3.
export const SCORE_TRANSFER_DELAY_FRAMES = 130;

export const SCOREBOARD_SLIDE_DISTANCE = 140;

export const DEFAULT_SCOREBOARD_COLOR = { r: 52, g: 48, b: 70, a: 90 };
export const GAMEOVER_SCOREBOARD_COLOR = { r: 52, g: 48, b: 70, a: 255 };
