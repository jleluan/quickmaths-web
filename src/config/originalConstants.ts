// Constants that reflect the original QuickMaths C++ implementation.
// Keeping these values in a single file makes it easy to cross-reference
// with the reference project and ensures the web version behaves the same.

// Dimensions of the playfield in the original game.
export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 960;

// Each block is a square of this size in pixels.
export const BLOCK_SIZE = 60;

// Number of columns that blocks can fall into. The horizontal grid
// occupies the full game width with equal columns.
export const NUM_COLUMNS = 6;

// Default time between block spawns in milliseconds at the start of the game.
export const INITIAL_SPAWN_INTERVAL = 2100;

// Amount in milliseconds by which the spawn interval should decrease every
// minute. In the original C++ game the drop interval reduces by 100ms
// every 60 seconds, gradually increasing difficulty. We provide a floor
// to prevent the interval from becoming too small.
export const DEFAULT_INTERVAL_MODIFIER = 100;

// Minimum allowed spawn interval in milliseconds. Once the interval
// reaches this threshold it will not be reduced further.
export const MIN_SPAWN_INTERVAL = 300;

// Default vertical fall speed in pixels per millisecond. The C++ version
// uses a velocity of 2.0 pixels per frame at 100 FPS, equating to
// roughly 200 pixels per second. Dividing by 1000 yields 0.2 px/ms.
export const DEFAULT_FALL_SPEED = 0.2;

// Increase applied to the score multiplier when more than two blocks are
// combined in a single sum. Matches the original "PER_BLOCK_MULTIPLIER_INCREASE".
export const PER_BLOCK_MULTIPLIER_INCREASE = 0.3;

// Baseline difficulty multiplier. Currently unused but exposed for future
// difficulty scaling features. It mirrors the C++ member m_difficultyLevel.
export const DEFAULT_DIFFICULTY_LEVEL = 1;
