// This module will eventually handle advanced spawning logic such as
// increasing difficulty over time and preventing unfair RNG patterns.
// For now, spawning is performed directly in the GameModel.

export function adjustSpawnInterval(elapsedTime: number): number {
  // TODO: implement difficulty progression rules
  return 2100;
}
