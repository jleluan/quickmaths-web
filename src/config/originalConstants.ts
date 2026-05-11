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

// The amount of time in milliseconds by which the spawn interval
// decreases every minute. In the original C++ game this value was
// 100.0f and the interval was reduced once per 60 second period.
export const DEFAULT_INTERVAL_MODIFIER = 100;

// The minimum allowed spawn interval. The C++ version clamps
// the interval to a reasonable floor to prevent it from becoming
// instantaneous. Without this floor the game would quickly become
// unplayable after a few minutes. This value approximates the
// behaviour of the reference implementation (600 ms).
export const MIN_SPAWN_INTERVAL = 600;

// Default vertical fall speed of blocks in pixels per millisecond. The
// original game tied fall speed to a frame based timer (2 px per
// tick at 100 fps). Converting that to a per millisecond value
// yields roughly 0.2 px/ms. If you adjust the physics or frame
// timing you may need to tweak this constant to maintain the same
// feel.
export const DEFAULT_FALL_SPEED = 0.2;

// Width of the scoreboard panel that sits on the right-hand side of
// the playfield. The original C++ constants define this as 270
// pixels. Keeping this separate from GAME_WIDTH allows the main
// playfield to remain the same size while the scoreboard can slide
// or animate independently.
export const SCOREBOARD_WIDTH = 270;

// Padding around elements inside the scoreboard. Matches the
// BORDERS_SIZE constant from the C++ version (10 px). This is
// used for consistent spacing of text and separators within the
// scoreboard.
export const SCOREBOARD_PADDING = 10;

// Amount by which the multiplier increases when more than two blocks
// are combined in a single sum. In the reference implementation
// m_multi increases by 0.3f per additional block beyond the second.
export const PER_BLOCK_MULTIPLIER_INCREASE = 0.3;

// Baseline difficulty multiplier. In the original C++ code this starts at
// 1.0 and increases when the block spawn interval decreases. We
// expose it here to allow the model to initialise its difficulty.
export const DEFAULT_DIFFICULTY_LEVEL = 1;

// Thickness of the coloured border between the playfield and the
// scoreboard. In the original game this was 10 pixels wide. While
// currently unused by the web build, it is exported for future use or
// for layout consistency with the C++ version.
export const BORDER_SIZE = 10;

// Amount in milliseconds by which the spawn interval should decrease every
// minute. In the original C++ game the drop interval reduces by 100ms
// every 60 seconds, gradually increasing difficulty. We provide a floor
// to prevent the interval from becoming too small.
// (Duplicate definitions removed below. See top of file for canonical
// values.)

// Distance the scoreboard slides left when the game is over. In the C++
// version the scoreboard moves left by 140 pixels to reveal the game over
// message【850230493058219†L539-L545】. Use the same value here.
export const SCOREBOARD_SLIDE_DISTANCE = 140;

// Number of frames to wait before starting to transfer points from
// `thisScore` to `score`. The original uses DEFAULT_FPS * 1.3 which
// equates to ~130 frames at 100 FPS【574761823807546†L11-L20】. We hardcode
// 130 since our web version runs independently of FPS.
export const SCORE_TRANSFER_DELAY_FRAMES = 130;

// Default colour of the scoreboard background expressed as an RGBA
// tuple. The original uses {52, 48, 70, 90} for an almost opaque dark
// purple【574761823807546†L18-L20】. Alpha is on a 0–255 scale to align with
// Phaser's colour format.
export const DEFAULT_SCOREBOARD_COLOR = { r: 52, g: 48, b: 70, a: 90 };

// Colour of the scoreboard once the game is over. In the original this
// becomes fully opaque {52, 48, 70, 255}【850230493058219†L769-L776】.
export const GAMEOVER_SCOREBOARD_COLOR = { r: 52, g: 48, b: 70, a: 255 };
