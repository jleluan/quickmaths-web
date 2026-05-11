/**
 * GameState enumerates the high-level phases of gameplay. This state
 * determines which operations are valid and when the model should be
 * updated. Scenes can react to changes in GameState to display the
 * appropriate UI.
 */
export enum GameState {
  /** Game has not started yet. */
  Ready,
  /** The main gameplay loop is running. */
  Running,
  /** Gameplay is paused, typically from the pause menu. */
  Paused,
  /** The game has ended due to loss conditions. */
  GameOver,
}
