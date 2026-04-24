import { describe, it, expect } from 'vitest';
import { isPrime } from './rsaMath.js';

describe('isPrime', () => {
  it('flags 2, 3, 61 as prime', () => {
    expect(isPrime(2n).isPrime).toBe(true);
    expect(isPrime(3n).isPrime).toBe(true);
    expect(isPrime(61n).isPrime).toBe(true);
  });

  it('flags 1, 0, 4, 9, 15 as composite', () => {
    expect(isPrime(1n).isPrime).toBe(false);
    expect(isPrime(0n).isPrime).toBe(false);
    expect(isPrime(4n).isPrime).toBe(false);
    expect(isPrime(9n).isPrime).toBe(false);
    expect(isPrime(15n).isPrime).toBe(false);
  });

  it('returns a trace with each divisor checked up to floor(sqrt(n))', () => {
    const { checks, isPrime: ok } = isPrime(25n);
    expect(ok).toBe(false);
    const divisors = checks.map(c => c.divisor);
    expect(divisors).toEqual([2n, 3n, 5n]);
    expect(checks.at(-1).divides).toBe(true);
  });

  it('short-circuits once a factor is found', () => {
    const { checks } = isPrime(9n);
    expect(checks.at(-1).divides).toBe(true);
    expect(checks.at(-1).divisor).toBe(3n);
  });
});
