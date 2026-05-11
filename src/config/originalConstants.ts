// Constants that reflect the original QuickMaths C++ implementation.
// Keeping these values in a single file makes it easy to cross-reference
// with the reference project and ensures the web version behaves the same.

// Dimensions of the playfield in the original game.
export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 960;

// Each block is a square of this size in pixels.
export const BLOCK_SIZE = 60;

// Number of columns that blocks can fall into.
export const NUM_COLUMNS = 6;

// Original C++ layout constants.
export const DEFAULT_SCOREBOARD_WIDTH = 270;
export const BORDERS_SIZE = 10;

// Blocks spawn at BLOCK_SIZE * (rand() % COLUMNS + 3), so the first
// gameplay column starts at x = 180 in the original coordinate space.
export const PLAYFIELD_X = BLOCK_SIZE * 3;

// Floor position from the original game: m_initialFloorY = height - 80.
export const FLOOR_TOP_Y = GAME_HEIGHT - 80;

// Default time between block spawns in milliseconds at the start of the game.
export const INITIAL_SPAWN_INTERVAL = 2100;

// Original difficulty progression: reduce drop interval by 100ms every minute.
export const DEFAULT_INTERVAL_MODIFIER = 100;

// Safety floor for the browser build so spawn interval cannot become negative.
export const MIN_SPAWN_INTERVAL = 300;

// Original block velocity: 2 px/frame at DEFAULT_FPS = 100, i.e. 200 px/s.
export const DEFAULT_FPS = 100;
export const DEFAULT_VELOCITY_PX_PER_FRAME = 2;
export const DEFAULT_FALL_SPEED = (DEFAULT_VELOCITY_PX_PER_FRAME * DEFAULT_FPS) / 1000;

// Original multiplier increment.
export const PER_BLOCK_MULTIPLIER_INCREASE = 0.3;

// Baseline difficulty multiplier.
export const DEFAULT_DIFFICULTY_LEVEL = 1;
