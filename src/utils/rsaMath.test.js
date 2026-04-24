import { describe, it, expect } from 'vitest';
import { isPrime, gcdTrace, extGcdTrace, modInverse, pickECandidates, modPowTrace, isqrt } from './rsaMath.js';

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

describe('extGcdTrace', () => {
  it('solves 17x + 3120y = 1 with x = -367, y = 2', () => {
    const { gcd, x, y } = extGcdTrace(17n, 3120n);
    expect(gcd).toBe(1n);
    expect(x).toBe(-367n);
    expect(y).toBe(2n);
    expect(17n * x + 3120n * y).toBe(1n);
  });

  it('emits a running table with s,t columns', () => {
    const { table } = extGcdTrace(17n, 3120n);
    expect(table[0]).toMatchObject({ oldR: 17n, r: 3120n });
    for (const row of table) {
      expect(row.oldS * 17n + row.oldT * 3120n).toBe(row.oldR);
    }
  });

  it('produces back-substitution step objects ending in gcd expression', () => {
    const { backSub } = extGcdTrace(17n, 3120n);
    expect(backSub.length).toBeGreaterThan(0);
    // First entry expresses the gcd: remainder === gcd
    expect(backSub[0].remainder).toBe(1n);
    // Each entry has structured fields
    for (const step of backSub) {
      expect(step).toHaveProperty('dividend');
      expect(step).toHaveProperty('divisor');
      expect(step).toHaveProperty('quotient');
      expect(step).toHaveProperty('remainder');
      // quotient is never the degenerate 0
      expect(step.quotient).not.toBe(0n);
      // identity: dividend === quotient*divisor + remainder
      expect(step.dividend).toBe(step.quotient * step.divisor + step.remainder);
    }
  });

  it('no backSub step has a zero quotient (no degenerate padding rows)', () => {
    const { backSub } = extGcdTrace(17n, 3120n);
    for (const step of backSub) {
      expect(step.quotient).not.toBe(0n);
    }
  });
});

describe('modInverse', () => {
  it('computes 17^-1 mod 3120 = 2753', () => {
    expect(modInverse(17n, 3120n)).toBe(2753n);
  });

  it('returns null when gcd != 1', () => {
    expect(modInverse(6n, 9n)).toBe(null);
  });
});

describe('pickECandidates', () => {
  it('returns the standard candidates with verdicts for phi = 3120', () => {
    const cands = pickECandidates(3120n);
    const e3 = cands.find(c => c.e === 3n);
    expect(e3.valid).toBe(false);
    const e17 = cands.find(c => c.e === 17n);
    expect(e17.valid).toBe(true);
    expect(e17.trace.gcd).toBe(1n);
  });

  it('always includes 65537 for completeness', () => {
    const cands = pickECandidates(3120n);
    expect(cands.some(c => c.e === 65537n)).toBe(true);
  });
});

describe('modPowTrace', () => {
  it('computes 65^17 mod 3233 = 2790', () => {
    const { result } = modPowTrace(65n, 17n, 3233n);
    expect(result).toBe(2790n);
  });

  it('decryption inverse: (65^17 mod 3233)^2753 mod 3233 = 65', () => {
    const c = modPowTrace(65n, 17n, 3233n).result;
    expect(modPowTrace(c, 2753n, 3233n).result).toBe(65n);
  });

  it('emits one square op per bit and one multiply per 1-bit', () => {
    const { steps, binary } = modPowTrace(65n, 17n, 3233n);
    expect(binary).toBe('10001');
    const squares = steps.filter(s => s.op === 'square').length;
    const muls = steps.filter(s => s.op === 'multiply').length;
    expect(squares).toBe(5);
    expect(muls).toBe(2);
  });

  it('returns 0 when modulus is 1', () => {
    expect(modPowTrace(5n, 3n, 1n).result).toBe(0n);
  });
});

describe('isqrt', () => {
  it('handles 0 and 1', () => {
    expect(isqrt(0n)).toBe(0n);
    expect(isqrt(1n)).toBe(1n);
  });
  it('returns exact sqrt for perfect squares', () => {
    expect(isqrt(4n)).toBe(2n);
    expect(isqrt(25n)).toBe(5n);
    expect(isqrt(10000n)).toBe(100n);
  });
  it('returns floor for non-perfect squares', () => {
    expect(isqrt(2n)).toBe(1n);
    expect(isqrt(15n)).toBe(3n);
    expect(isqrt(99n)).toBe(9n);
  });
  it('converges on large BigInts', () => {
    expect(isqrt(10n ** 20n)).toBe(10n ** 10n);
  });
});
