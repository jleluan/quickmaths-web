/**
 * Generates a weighted random value for a block. The implementation mirrors
 * the C++ version in the original QuickMaths, which selects one of eight
 * distributions. This function should be used whenever a new block is
 * spawned to ensure comparable difficulty and pacing.
 */
export function getRandomValue(): number {
  const intermediates: number[] = [
    // Two values between 2 and 6 inclusive
    Math.floor(Math.random() * 5) + 2,
    Math.floor(Math.random() * 5) + 2,
    // One value between 2 and 9 inclusive
    Math.floor(Math.random() * 8) + 2,
    // One value between 1 and 10 inclusive
    Math.floor(Math.random() * 10) + 1,
    // One value between 2 and 10 inclusive
    Math.floor(Math.random() * 9) + 2,
    // Two values between 2 and 20 inclusive
    Math.floor(Math.random() * 19) + 2,
    Math.floor(Math.random() * 19) + 2,
    // One value between 1 and 99 inclusive
    Math.floor(Math.random() * 99) + 1,
  ];
  const index = Math.floor(Math.random() * intermediates.length);
  return intermediates[index];
}
