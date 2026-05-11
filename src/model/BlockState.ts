/**
 * Defines the properties of a block in the game model. The view layer
 * synchronises its appearance with these values. Blocks are immutable
 * objects in terms of identity; any modifications should be performed
 * through GameModel methods.
 */
export interface BlockState {
  id: number;
  value: number;
  x: number;
  y: number;
  /**
   * Whether the block is currently active and should be rendered/checked.
   */
  active: boolean;
  /**
   * Whether the block has been selected by the player via left click.
   */
  selected: boolean;
}
