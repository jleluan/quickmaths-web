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
