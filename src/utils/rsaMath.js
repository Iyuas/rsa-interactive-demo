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
    const prev = table[i - 1];
    divs.push({
      dividend: prev.oldR,
      divisor: prev.r,
      quotient: table[i].q,
      remainder: table[i].r,
    });
  }
  const gcdIdx = divs.length - 1;
  if (gcdIdx < 0) return [];
  const lines = [];
  let line = `${divs[gcdIdx].remainder} = ${divs[gcdIdx].dividend} − ${divs[gcdIdx].quotient}·${divs[gcdIdx].divisor}`;
  lines.push(line);
  for (let i = gcdIdx - 1; i >= 0; i--) {
    const d = divs[i];
    line += `\n    = ... (substitute ${d.remainder} = ${d.dividend} − ${d.quotient}·${d.divisor})`;
    lines.push(line);
  }
  return lines;
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
