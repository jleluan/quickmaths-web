/**
 * Pure gameplay state for a falling QuickMaths block.
 *
 * Positions are top-left coordinates, matching the original C++ sprite
 * coordinate style.
 */
export interface BlockState {
  id: number;
  value: number;
  x: number;
  y: number;

  active: boolean;
  selected: boolean;

  /**
   * True while the block is moving downward.
   */
  falling: boolean;

  /**
   * True once the block has collided with the floor or another block at
   * least once. The original changes velocity after first landing.
   */
  hasLanded: boolean;

  velocityY: number;

  /**
   * Marks this block for destruction after a correct equation.
   */
  markedForRemoval?: boolean;

  /**
   * Used by the game-over visual sweep. Deactivated blocks remain visible
   * but are no longer useful as number blocks.
   */
  deactivated?: boolean;
}
