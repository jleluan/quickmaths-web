/**
 * Defines the properties of a block in the game model. The view layer
 * synchronises its appearance with these values.
 */
export interface BlockState {
  id: number;
  value: number;
  x: number;
  y: number;

  /**
   * Whether the block should be considered in gameplay.
   * This corresponds to the original isActive() check.
   */
  active: boolean;

  /**
   * Whether the block has been selected by the player via left click.
   */
  selected: boolean;

  /**
   * Whether the block is currently moving downward.
   */
  falling: boolean;

  /**
   * Current vertical velocity in pixels per millisecond.
   */
  velocityY: number;

  /**
   * Marks a block for removal after a correct equation.
   */
  markedForRemoval?: boolean;
}
