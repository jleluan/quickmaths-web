import { GameModel } from '../model/GameModel';

// Determines whether the game is over based on the current block stack.
// The original game ends when the highest block crosses the top of the
// screen. This module will detect that condition and set the model's
// gameState accordingly.

export function checkGameOver(model: GameModel, gameHeight: number): boolean {
  return model.blocks.some((b) => b.active && b.y - 30 >= gameHeight);
}
