// Scoring rules mirror the C++ implementation. The GameModel currently
// uses a simplified scoring formula inside handleBlockRightClick. In
// future this module can encapsulate score multipliers, chain bonuses
// and difficulty scaling.

export function calculateScore(sum: number, multiplier: number): number {
  return sum * multiplier;
}
