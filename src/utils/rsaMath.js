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
