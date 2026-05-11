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

  /**
   * Whether the block has come to rest on the floor or on top of another
   * landed block. In the original C++ game both falling and landed
   * blocks could be selected by the player. The landed flag is used
   * solely for collision resolution; input handlers should not restrict
   * selection based on this value.
   */
  landed: boolean;

  /**
   * Current vertical velocity in pixels per millisecond. Starts at
   * DEFAULT_FALL_SPEED and is set to 0 when a block lands. Keeping
   * velocity on the block allows more complex physics (e.g. bounce)
   * if implemented later.
   */
  velocityY: number;

  /**
   * Marks a block for removal at the end of the current update loop. This
   * mirrors the C++ behaviour where selected and target blocks are not
   * destroyed immediately but flagged until all logic has executed. Views
   * can inspect this flag to play fade animations.
   */
  markedForRemoval?: boolean;
}
