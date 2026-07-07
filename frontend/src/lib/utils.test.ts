import { describe, it, expect } from 'vitest';
import { calculateVestedAmount } from './utils';

describe('Vesting Math calculation tests', () => {
  it('returns 0 if now is before or equal to start time', () => {
    // start time = 100, now = 100
    expect(calculateVestedAmount(100, 100, 10, 100)).toBe(0);
    // start time = 100, now = 90 (skewed clock fallback)
    expect(calculateVestedAmount(100, 100, 10, 90)).toBe(0);
  });

  it('calculates linear progression correctly at middle milestones', () => {
    // 50% through: start time = 100, now = 105, duration = 10, deposit = 100
    expect(calculateVestedAmount(100, 100, 10, 105)).toBe(50);
    // 30% through: start time = 100, now = 103, duration = 10, deposit = 100
    expect(calculateVestedAmount(100, 100, 10, 103)).toBe(30);
  });

  it('returns 100% deposit once elapsed time meets or exceeds duration', () => {
    // exactly equal: start time = 100, now = 110, duration = 10
    expect(calculateVestedAmount(100, 100, 10, 110)).toBe(100);
    // past duration: start time = 100, now = 120, duration = 10
    expect(calculateVestedAmount(100, 100, 10, 120)).toBe(100);
  });

  it('gracefully handles boundary values like zero or negative inputs', () => {
    expect(calculateVestedAmount(0, 100, 10, 105)).toBe(0);
    expect(calculateVestedAmount(-10, 100, 10, 105)).toBe(0);
    expect(calculateVestedAmount(100, 100, 0, 105)).toBe(0);
    expect(calculateVestedAmount(100, 100, -5, 105)).toBe(0);
  });
});
