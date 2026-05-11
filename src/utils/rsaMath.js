// Pure BigInt RSA math. Every function is side-effect free and returns a trace
// (array of step objects) alongside the numeric result so UI components can
// render step-by-step educational animations.

export function isqrt(n) {
  if (n < 0n) throw new Error('negative');
  if (n < 2n) return n;
  let x = n;
  let y = (x + 1n) >> 1n;
  while (y < x) { x = y; y = (x + n / x) >> 1n; }
  return x;
}

export function gcdTrace(a, b) {
  let [x, y] = a >= b ? [a, b] : [b, a];
  const rows = [];
  while (y !== 0n) {
    const q = x / y;
    const r = x % y;
    rows.push({ dividend: x, divisor: y, quotient: q, remainder: r });
    [x, y] = [y, r];
  }
  return { gcd: x, rows };
}

export function extGcdTrace(a, b) {
  let [oldR, r] = [a, b];
  let [oldS, s] = [1n, 0n];
  let [oldT, t] = [0n, 1n];
  const table = [{ oldR, r, oldS, s, oldT, t, q: null }];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
    table.push({ oldR, r, oldS, s, oldT, t, q });
  }
  return {
    gcd: oldR,
    x: oldS,
    y: oldT,
    table,
    backSub: buildBackSub(a, b, table),
  };
}

function buildBackSub(a, b, table) {
  const divs = [];
  for (let i = 1; i < table.length; i++) {
    if (table[i].r === 0n) continue;
    if (table[i].q === 0n) continue;
    const prev = table[i - 1];
    divs.push({
      dividend: prev.oldR,
      divisor: prev.r,
      quotient: table[i].q,
      remainder: table[i].r,
    });
  }
  // Return in reverse: gcd-producing step first, then each prior step to substitute
  return divs.slice().reverse();
}

export function modInverse(e, phi) {
  const { gcd, x } = extGcdTrace(e, phi);
  if (gcd !== 1n) return null;
  return ((x % phi) + phi) % phi;
}

export function isPrime(n) {
  const checks = [];
  if (n < 2n) return { isPrime: false, checks, reason: 'less than 2' };
  if (n === 2n) return { isPrime: true, checks };

  const limit = isqrt(n);
  // Check 2 first, then odd numbers only
  for (let d = 2n; d <= limit; d = d === 2n ? 3n : d + 2n) {
    const r = n % d;
    const divides = r === 0n;
    checks.push({ divisor: d, remainder: r, divides });
    if (divides) return { isPrime: false, checks };
  }
  return { isPrime: true, checks };
}

const DEFAULT_E_CANDIDATES = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 65537n];

export function pickECandidates(phi, candidates = DEFAULT_E_CANDIDATES) {
  return candidates.map(e => {
    if (e >= phi) return { e, trace: null, valid: false };
    const trace = gcdTrace(phi, e);
    return { e, trace, valid: trace.gcd === 1n };
  });
}

export function modPowTrace(base, exp, n) {
  if (n === 1n) return { result: 0n, binary: exp.toString(2), steps: [] };
  base = ((base % n) + n) % n;

  const binary = exp.toString(2);
  const steps = [];
  let result = 1n;

  for (let i = 0; i < binary.length; i++) {
    const bit = binary[i];
    const before = result;
    result = (result * result) % n;
    steps.push({ bitIndex: i, bit, op: 'square', before, after: result });
    if (bit === '1') {
      const beforeMul = result;
      result = (result * base) % n;
      steps.push({ bitIndex: i, bit, op: 'multiply', before: beforeMul, after: result, base });
    }
  }
  return { result, binary, steps };
}
