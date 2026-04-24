import { describe, it, expect } from 'vitest';
import { isPrime, gcdTrace } from './rsaMath.js';

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

describe('gcdTrace', () => {
  it('returns gcd(3120, 17) = 1 with 4 division rows', () => {
    const { gcd, rows } = gcdTrace(3120n, 17n);
    expect(gcd).toBe(1n);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toEqual({ dividend: 3120n, divisor: 17n, quotient: 183n, remainder: 9n });
    expect(rows[3].remainder).toBe(0n);
  });

  it('handles a > b and a < b symmetrically', () => {
    expect(gcdTrace(17n, 3120n).gcd).toBe(1n);
    expect(gcdTrace(3120n, 17n).gcd).toBe(1n);
  });

  it('returns gcd(12, 18) = 6', () => {
    expect(gcdTrace(18n, 12n).gcd).toBe(6n);
  });
});
