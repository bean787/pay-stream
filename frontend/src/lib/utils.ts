/**
 * Re-usable helper utility to calculate the client-side linearly accrued/vested amount.
 * Matches the Rust contract vested_amount calculation logic.
 *
 * @param deposit Total deposit amount locked in the stream
 * @param startTime Start timestamp in seconds
 * @param duration Total vesting duration in seconds
 * @param now Current timestamp in seconds
 * @returns Linearly vested token balance
 */
export function calculateVestedAmount(
  deposit: number,
  startTime: number,
  duration: number,
  now: number
): number {
  if (deposit <= 0 || duration <= 0) return 0;
  
  const elapsed = Math.max(0, now - startTime);
  if (elapsed >= duration) {
    return deposit;
  }
  
  return (deposit * elapsed) / duration;
}
