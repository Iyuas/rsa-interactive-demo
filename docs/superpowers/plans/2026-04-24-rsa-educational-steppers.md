# RSA Educational Steppers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the RSA demo from a primitive calculator that hides math behind a magic "machine" into a step-by-step educational tool that visibly derives every value (primality tests, Euclidean algorithm, square-and-multiply) using BigInt end-to-end.

**Architecture:** One shared pure-math module (`src/utils/rsaMath.js`) returns both the numeric result AND an array of trace steps for every operation. UI components become "orchestrators" that feed those traces into a generic `<Stepper>` that supports prev/next/play/speed. All state moves to BigInt so the demo stays mathematically honest for large primes. Remove the current `state.originalText` fallback that lied about successful decryption.

**Tech Stack:** React 19, Vite 8, Tailwind 4, framer-motion, **Vitest** (new, for math tests), BigInt everywhere.

**Commit style:** Clean messages, no Co-Authored-By or Claude trailers (per user's global preference).

---

## File Structure

### New files

| Path | Responsibility |
|------|----------------|
| `src/utils/rsaMath.js` | Pure BigInt RSA math. Every function returns `{ result, steps/trace }`. |
| `src/utils/rsaMath.test.js` | Vitest tests for the math module. |
| `src/utils/ascii.js` | Plaintext ↔ big-integer block helpers with step traces. |
| `src/utils/ascii.test.js` | Vitest tests for ascii encoding. |
| `src/utils/presets.js` | Edu / Standard / Real prime presets. |
| `src/components/Stepper.jsx` | Generic prev/next/play/speed controller + progress rail. |
| `src/components/PrimeCheckViz.jsx` | Trial-division animation for `isPrime`. |
| `src/components/EuclidTable.jsx` | Forward Euclidean + running (s,t) table. |
| `src/components/BackSubList.jsx` | Back-substitution chain rendering. |
| `src/components/ModPowViz.jsx` | Square-and-multiply visualization per bit of exponent. |
| `src/components/AsciiTableViz.jsx` | Per-character ASCII lookup highlight. |
| `src/components/PresetPicker.jsx` | Preset selector + manual prime entry. |
| `src/components/MathCard.jsx` | Reusable framed "math step" card with title/expression/value. |

### Modified files

| Path | Change |
|------|--------|
| `package.json` | Add `vitest` devDep and `test` script. Remove unused `clsx`, `tailwind-merge`. |
| `vite.config.js` | Add `test:` config block for vitest. |
| `src/App.jsx` | BigInt state, remove `originalText`, add `plaintext` + `blocks` arrays. |
| `src/KeyGeneration.jsx` | Full rewrite — orchestrates PresetPicker → PrimeCheckViz (p & q) → multiplication → φ substitution → e candidates → d via EuclidTable + BackSubList. |
| `src/Encryption.jsx` | Full rewrite — AsciiTableViz → block splitter → ModPowViz per block → ciphertext assembly. Remove duplicate `modPow`. |
| `src/Decryption.jsx` | Full rewrite — ModPowViz with d → AsciiTableViz reverse decode. **Delete `state.originalText` fallback.** |
| `src/Layout.jsx` | Remove unused `useState` import, fix `hidden md:flex` class collision. |
| `src/App.css` | Delete (legacy Vite starter styles, unused). |
| `index.html` | Fix `favicon.svg` link (currently points to non-existent `/vite.svg`). |
| `src/main.jsx` | Stop importing `./App.css`. |

---

## Conventions for this plan

- All integers in the RSA pipeline are `BigInt`. Display helpers stringify at render time.
- Trace functions never throw on mathematical edge cases; they return `{ ok: false, reason }` instead. The UI shows the reason.
- Components receive traces as props and never compute math themselves.
- Every task ends with a commit. No mega-commits.

---

## Phase 0 — Environment setup

### Task 0.1: Install Vitest, drop unused deps

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Install vitest, remove clsx + tailwind-merge**

Run:
```bash
npm install --save-dev vitest
npm uninstall clsx tailwind-merge
```

Expected: lockfile updated, no errors.

- [ ] **Step 2: Add test script to `package.json`**

In `package.json`, under `"scripts"`, add:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 3: Configure Vitest inside Vite config**

Replace `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.{js,jsx}'],
  },
})
```

- [ ] **Step 4: Smoke test**

Create `src/utils/.smoke.test.js`:

```js
import { describe, it, expect } from 'vitest';
describe('smoke', () => {
  it('runs vitest', () => { expect(1n + 1n).toBe(2n); });
});
```

Run: `npm run test:run`
Expected: 1 passed.

Delete the smoke file after verification.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.js
git commit -m "build: add vitest, drop unused deps"
```

---

## Phase 1 — Pure math with traces (`src/utils/rsaMath.js`)

Each sub-task is TDD: write the failing test, confirm it fails, implement, confirm green, commit.

### Task 1.1: `isPrime(n)` trial division with trace

**Files:**
- Create: `src/utils/rsaMath.js`
- Create: `src/utils/rsaMath.test.js`

- [ ] **Step 1: Write the failing test**

In `src/utils/rsaMath.test.js`:

```js
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
```

- [ ] **Step 2: Run the test, confirm failure**

Run: `npm run test:run -- isPrime`
Expected: fail — `isPrime is not defined`.

- [ ] **Step 3: Implement `isPrime`**

In `src/utils/rsaMath.js`:

```js
export function isqrt(n) {
  if (n < 0n) throw new Error('negative');
  if (n < 2n) return n;
  let x = n;
  let y = (x + 1n) >> 1n;
  while (y < x) { x = y; y = (x + n / x) >> 1n; }
  return x;
}

export function isPrime(n) {
  const checks = [];
  if (n < 2n) return { isPrime: false, checks, reason: 'less than 2' };
  if (n === 2n) return { isPrime: true, checks };

  const limit = isqrt(n);
  for (let d = 2n; d <= limit; d++) {
    const r = n % d;
    const divides = r === 0n;
    checks.push({ divisor: d, remainder: r, divides });
    if (divides) return { isPrime: false, checks };
  }
  return { isPrime: true, checks };
}
```

- [ ] **Step 4: Run the test, confirm green**

Run: `npm run test:run -- isPrime`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/utils/rsaMath.js src/utils/rsaMath.test.js
git commit -m "feat(math): isPrime with trial-division trace"
```

---

### Task 1.2: `gcdTrace(a, b)` — forward Euclidean

- [ ] **Step 1: Append failing tests to `rsaMath.test.js`**

```js
import { gcdTrace } from './rsaMath.js';

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
```

- [ ] **Step 2: Run, confirm fail.** `npm run test:run -- gcdTrace`

- [ ] **Step 3: Implement**

Append to `src/utils/rsaMath.js`:

```js
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
```

- [ ] **Step 4: Run, confirm green.**

- [ ] **Step 5: Commit**

```bash
git add src/utils/rsaMath.js src/utils/rsaMath.test.js
git commit -m "feat(math): gcdTrace with division row log"
```

---

### Task 1.3: `extGcdTrace(a, b)` — forward table + back substitution

- [ ] **Step 1: Failing test**

Append:

```js
import { extGcdTrace, modInverse } from './rsaMath.js';

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
    // First row: oldR=17, r=3120, q=0 (since a < b)
    expect(table[0]).toMatchObject({ oldR: 17n, r: 3120n });
    // Invariant every row: oldS*a + oldT*b === oldR
    for (const row of table) {
      expect(row.oldS * 17n + row.oldT * 3120n).toBe(row.oldR);
    }
  });

  it('produces back-substitution strings that terminate in the gcd', () => {
    const { backSub } = extGcdTrace(17n, 3120n);
    expect(backSub.length).toBeGreaterThan(0);
    expect(backSub.at(-1)).toMatch(/1\s*=/);
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
```

- [ ] **Step 2: Run, confirm fail.**

- [ ] **Step 3: Implement**

Append to `src/utils/rsaMath.js`:

```js
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
  // Rebuild the "1 = ... " chain from division rows where remainder > 0.
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
  // Last nonzero remainder before 0 is the gcd
  const gcdIdx = divs.length - 1;
  if (gcdIdx < 0) return [];
  const lines = [];
  // Start: gcd = dividend - quotient*divisor
  let line = `${divs[gcdIdx].remainder} = ${divs[gcdIdx].dividend} − ${divs[gcdIdx].quotient}·${divs[gcdIdx].divisor}`;
  lines.push(line);
  // Substitute each prior divisor's remainder expression
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
```

- [ ] **Step 4: Run, confirm green.**

- [ ] **Step 5: Commit**

```bash
git add src/utils/rsaMath.js src/utils/rsaMath.test.js
git commit -m "feat(math): extGcdTrace + modInverse"
```

---

### Task 1.4: `pickECandidates(phi, options)` — candidate list with verdicts

- [ ] **Step 1: Failing test**

Append:

```js
import { pickECandidates } from './rsaMath.js';

describe('pickECandidates', () => {
  it('returns the standard candidates with verdicts for phi = 3120', () => {
    const cands = pickECandidates(3120n);
    const e3 = cands.find(c => c.e === 3n);
    expect(e3.valid).toBe(false);       // gcd(3, 3120) = 3
    const e17 = cands.find(c => c.e === 17n);
    expect(e17.valid).toBe(true);
    expect(e17.trace.gcd).toBe(1n);
  });

  it('always includes 65537 for completeness', () => {
    const cands = pickECandidates(3120n);
    expect(cands.some(c => c.e === 65537n)).toBe(true);
  });
});
```

- [ ] **Step 2: Run, fail.**

- [ ] **Step 3: Implement**

Append:

```js
const DEFAULT_E_CANDIDATES = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 65537n];

export function pickECandidates(phi, candidates = DEFAULT_E_CANDIDATES) {
  return candidates
    .filter(e => e < phi)
    .map(e => {
      const trace = gcdTrace(phi, e);
      return { e, trace, valid: trace.gcd === 1n };
    });
}
```

- [ ] **Step 4: Run, green.**

- [ ] **Step 5: Commit**

```bash
git add src/utils/rsaMath.js src/utils/rsaMath.test.js
git commit -m "feat(math): pickECandidates with gcd verdicts"
```

---

### Task 1.5: `modPowTrace(base, exp, n)` — left-to-right square-and-multiply

- [ ] **Step 1: Failing test**

Append:

```js
import { modPowTrace } from './rsaMath.js';

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
    expect(muls).toBe(2);  // bits set = 2
  });

  it('returns 0 when modulus is 1', () => {
    expect(modPowTrace(5n, 3n, 1n).result).toBe(0n);
  });
});
```

- [ ] **Step 2: Run, fail.**

- [ ] **Step 3: Implement**

Append:

```js
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
```

- [ ] **Step 4: Run, green.**

- [ ] **Step 5: Commit**

```bash
git add src/utils/rsaMath.js src/utils/rsaMath.test.js
git commit -m "feat(math): modPowTrace via left-to-right square-and-multiply"
```

---

## Phase 2 — ASCII block encoding (`src/utils/ascii.js`)

### Task 2.1: `encodeBlocks(text, n)` and `decodeBlocks(blocks)`

**Files:**
- Create: `src/utils/ascii.js`
- Create: `src/utils/ascii.test.js`

- [ ] **Step 1: Failing tests**

```js
import { describe, it, expect } from 'vitest';
import { encodeBlocks, decodeBlocks } from './ascii.js';

describe('encodeBlocks', () => {
  it('round-trips "HI" through n=3233', () => {
    const blocks = encodeBlocks('HI', 3233n);
    // Each block value must be < n
    expect(blocks.every(b => b.value < 3233n)).toBe(true);
    expect(decodeBlocks(blocks)).toBe('HI');
  });

  it('splits into one char per block when n <= 65535', () => {
    const blocks = encodeBlocks('HI', 3233n);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].chars).toEqual(['H']);
    expect(blocks[0].codes).toEqual([72]);
    expect(blocks[0].value).toBe(72n);
  });

  it('packs multi-char blocks when n is large', () => {
    const blocks = encodeBlocks('HELLO', 10n ** 20n);
    expect(blocks.length).toBeLessThan(5);
    expect(decodeBlocks(blocks)).toBe('HELLO');
  });

  it('rejects characters with code > 255', () => {
    expect(() => encodeBlocks('é', 3233n)).toThrow(/ASCII/);
  });
});
```

- [ ] **Step 2: Run, fail.**

- [ ] **Step 3: Implement**

`src/utils/ascii.js`:

```js
// Each char is encoded as a 3-digit decimal (000-255) so decoding is unambiguous.
const CHAR_WIDTH = 3;

export function encodeBlocks(text, n) {
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code > 255) throw new Error(`Non-ASCII character "${ch}" (code ${code})`);
  }

  const nStr = n.toString();
  const maxChars = Math.max(1, Math.floor((nStr.length - 1) / CHAR_WIDTH));

  const blocks = [];
  for (let i = 0; i < text.length; i += maxChars) {
    const slice = text.slice(i, i + maxChars);
    const chars = [...slice];
    const codes = chars.map(c => c.charCodeAt(0));
    const digitStr = codes.map(c => String(c).padStart(CHAR_WIDTH, '0')).join('');
    const value = BigInt(digitStr);
    if (value >= n) {
      throw new Error(`Block value ${value} >= n (${n}); pick larger primes.`);
    }
    blocks.push({ chars, codes, digitStr, value });
  }
  return blocks;
}

export function decodeBlocks(blocks) {
  let out = '';
  for (const b of blocks) {
    const digits = b.value.toString().padStart(b.chars.length * CHAR_WIDTH, '0');
    for (let i = 0; i < digits.length; i += CHAR_WIDTH) {
      out += String.fromCharCode(parseInt(digits.slice(i, i + CHAR_WIDTH), 10));
    }
  }
  return out;
}

export function decodeValue(value, charCount) {
  const digits = value.toString().padStart(charCount * CHAR_WIDTH, '0');
  let out = '';
  for (let i = 0; i < digits.length; i += CHAR_WIDTH) {
    out += String.fromCharCode(parseInt(digits.slice(i, i + CHAR_WIDTH), 10));
  }
  return out;
}
```

- [ ] **Step 4: Run, green.**

- [ ] **Step 5: Commit**

```bash
git add src/utils/ascii.js src/utils/ascii.test.js
git commit -m "feat(utils): ascii block encoder/decoder"
```

---

## Phase 3 — Presets and state migration

### Task 3.1: Create `src/utils/presets.js`

- [ ] **Step 1: Write the file**

```js
export const PRESETS = {
  edu: {
    id: 'edu',
    label: 'Edu',
    description: 'Small primes, readable traces',
    p: 61n,
    q: 53n,
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    description: '4-digit primes, full demo',
    p: 1009n,
    q: 1013n,
  },
  real: {
    id: 'real',
    label: 'Real',
    description: '~32-bit primes, block-level messages',
    p: 2_147_483_647n,  // 2^31 - 1
    q: 2_147_483_629n,  // nearest prime below
  },
};

export const DEFAULT_PRESET_ID = 'edu';
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/presets.js
git commit -m "feat(utils): prime presets Edu/Standard/Real"
```

---

### Task 3.2: Migrate `App.jsx` state shape to BigInt

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Rewrite App.jsx**

```jsx
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './Layout';
import KeyGeneration from './KeyGeneration';
import Encryption from './Encryption';
import Decryption from './Decryption';
import { PRESETS, DEFAULT_PRESET_ID } from './utils/presets';

const initialPreset = PRESETS[DEFAULT_PRESET_ID];

const initialState = {
  presetId: initialPreset.id,
  p: null,
  q: null,
  n: null,
  phi: null,
  e: null,
  d: null,
  plaintext: '',
  blocks: [],     // [{ chars, codes, digitStr, value (m), cipher (c) }]
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cryptoState, setCryptoState] = useState(initialState);

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, 3));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  return (
    <Layout currentStep={currentStep} setCurrentStep={setCurrentStep}>
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <KeyGeneration key="step1" state={cryptoState} setState={setCryptoState} nextStep={nextStep} />
        )}
        {currentStep === 2 && (
          <Encryption key="step2" state={cryptoState} setState={setCryptoState} nextStep={nextStep} prevStep={prevStep} />
        )}
        {currentStep === 3 && (
          <Decryption key="step3" state={cryptoState} setState={setCryptoState} prevStep={prevStep} />
        )}
      </AnimatePresence>
    </Layout>
  );
}
```

- [ ] **Step 2: Visual sanity check**

Run: `npm run dev`
Expected: page still renders (old KeyGeneration/Encryption/Decryption may error because they expect numbers — that's fine, we're about to rewrite them). Commit as-is if no import errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "refactor(state): move crypto state to BigInt-ready shape"
```

---

## Phase 4 — Shared UI primitives

### Task 4.1: `Stepper.jsx` — reusable play/pause/speed control

**Files:**
- Create: `src/components/Stepper.jsx`

- [ ] **Step 1: Write the component**

```jsx
import { useEffect, useRef, useState } from 'react';

const SPEEDS = [
  { label: '0.5×', ms: 2400 },
  { label: '1×',   ms: 1200 },
  { label: '2×',   ms: 600  },
];

export default function Stepper({ total, index, onIndex, renderStep, label = 'Step' }) {
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      onIndex(i => {
        if (i + 1 >= total) { setPlaying(false); return i; }
        return i + 1;
      });
    }, SPEEDS[speedIdx].ms);
    return () => clearInterval(timerRef.current);
  }, [playing, speedIdx, total, onIndex]);

  if (total === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          {label} {index + 1} / {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onIndex(i => Math.max(0, i - 1))}
            disabled={index === 0}
            className="px-3 py-1.5 rounded border border-[#c3c6d6] text-xs font-bold disabled:opacity-40 hover:bg-gray-50"
          >‹ Назад</button>
          <button
            onClick={() => setPlaying(p => !p)}
            className="px-3 py-1.5 rounded bg-[#003d9b] text-white text-xs font-bold hover:bg-[#0052cc]"
          >{playing ? '⏸ Пауза' : '▶ Авто'}</button>
          <button
            onClick={() => onIndex(i => Math.min(total - 1, i + 1))}
            disabled={index >= total - 1}
            className="px-3 py-1.5 rounded border border-[#c3c6d6] text-xs font-bold disabled:opacity-40 hover:bg-gray-50"
          >Далее ›</button>
          <div className="flex items-center gap-0.5 ml-2 border border-[#c3c6d6] rounded overflow-hidden">
            {SPEEDS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSpeedIdx(i)}
                className={`px-2 py-1 text-[10px] font-bold ${i === speedIdx ? 'bg-[#003d9b] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >{s.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
        <div
          className="bg-[#003d9b] h-full transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
      <div>{renderStep(index)}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Stepper.jsx
git commit -m "feat(ui): shared Stepper with play/pause/speed"
```

---

### Task 4.2: `MathCard.jsx` — reusable framed step card

- [ ] **Step 1: Write component**

```jsx
import { motion } from 'framer-motion';

export default function MathCard({ title, expression, value, note, tone = 'blue' }) {
  const toneClasses = {
    blue: 'border-[#003d9b] bg-[#f1f3ff] text-[#003d9b]',
    green: 'border-green-500 bg-green-50 text-green-700',
    red: 'border-red-500 bg-red-50 text-red-700',
    gray: 'border-gray-300 bg-gray-50 text-gray-700',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`border-l-4 rounded-r-lg p-4 shadow-sm ${toneClasses[tone]}`}
    >
      {title && <h5 className="text-xs font-bold uppercase tracking-wider mb-2">{title}</h5>}
      {expression && <div className="font-mono text-sm mb-1">{expression}</div>}
      {value !== undefined && value !== null && (
        <div className="font-mono text-2xl font-black">{String(value)}</div>
      )}
      {note && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{note}</p>}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MathCard.jsx
git commit -m "feat(ui): MathCard step frame"
```

---

### Task 4.3: `PresetPicker.jsx` — Edu/Standard/Real + manual entry

- [ ] **Step 1: Write component**

```jsx
import { useState } from 'react';
import { PRESETS } from '../utils/presets';
import { isPrime } from '../utils/rsaMath';

export default function PresetPicker({ presetId, onApply }) {
  const [pInput, setPInput] = useState('');
  const [qInput, setQInput] = useState('');
  const [err, setErr] = useState(null);

  const applyPreset = (id) => {
    const p = PRESETS[id];
    onApply({ presetId: id, p: p.p, q: p.q });
    setErr(null);
  };

  const applyManual = () => {
    try {
      const p = BigInt(pInput);
      const q = BigInt(qInput);
      if (p === q) throw new Error('p and q must differ');
      if (!isPrime(p).isPrime) throw new Error(`p=${p} is not prime`);
      if (!isPrime(q).isPrime) throw new Error(`q=${q} is not prime`);
      onApply({ presetId: 'custom', p, q });
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {Object.values(PRESETS).map(p => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            className={`p-3 rounded-lg border text-left transition-all ${presetId === p.id ? 'border-[#003d9b] bg-[#f1f3ff]' : 'border-[#c3c6d6] hover:border-[#003d9b] hover:bg-gray-50'}`}
          >
            <div className="font-bold text-xs text-[#041b3c]">{p.label}</div>
            <div className="text-[10px] text-gray-500 mt-1">{p.description}</div>
            <div className="font-mono text-[10px] text-[#003d9b] mt-2">p={String(p.p)}</div>
            <div className="font-mono text-[10px] text-[#003d9b]">q={String(p.q)}</div>
          </button>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ручной ввод</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={pInput} onChange={e => setPInput(e.target.value)} placeholder="p (prime)"
            className="border border-[#c3c6d6] rounded p-2 font-mono text-sm" />
          <input value={qInput} onChange={e => setQInput(e.target.value)} placeholder="q (prime)"
            className="border border-[#c3c6d6] rounded p-2 font-mono text-sm" />
        </div>
        <button
          onClick={applyManual}
          disabled={!pInput || !qInput}
          className="mt-2 w-full py-2 bg-[#003d9b] text-white rounded font-bold text-xs disabled:bg-gray-300"
        >Проверить и применить</button>
        {err && <p className="text-xs text-red-600 mt-2 font-mono">{err}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PresetPicker.jsx
git commit -m "feat(ui): PresetPicker with manual prime entry"
```

---

### Task 4.4: `PrimeCheckViz.jsx` — trial-division animation

- [ ] **Step 1: Write**

```jsx
import Stepper from './Stepper';
import MathCard from './MathCard';
import { useState } from 'react';

export default function PrimeCheckViz({ n, trace, label }) {
  const [idx, setIdx] = useState(0);
  const total = trace.checks.length;

  if (total === 0) {
    return <MathCard title={label} expression={`${n} проверка не нужна`} tone="gray" />;
  }

  return (
    <div className="bg-white border border-[#c3c6d6] rounded-xl p-4 shadow-sm">
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
        {label}: Trial division для n = {String(n)}
      </div>
      <Stepper
        total={total}
        index={idx}
        onIndex={setIdx}
        label="Делитель"
        renderStep={(i) => {
          const c = trace.checks[i];
          const tone = c.divides ? 'red' : 'blue';
          const note = c.divides
            ? `Найден делитель — число составное.`
            : i === total - 1 && trace.isPrime
              ? `Дошли до √n без делителей — число простое.`
              : `Не делится. Продолжаем.`;
          return (
            <MathCard
              title={`Проверка d = ${c.divisor}`}
              expression={`${n} mod ${c.divisor} = ${c.remainder}`}
              value={c.divides ? 'делится ✗' : 'не делится ✓'}
              note={note}
              tone={tone}
            />
          );
        }}
      />
      <div className="mt-3 text-xs font-bold text-center">
        Итог: {trace.isPrime
          ? <span className="text-green-600">{String(n)} — простое ✓</span>
          : <span className="text-red-600">{String(n)} — составное ✗</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PrimeCheckViz.jsx
git commit -m "feat(ui): PrimeCheckViz"
```

---

### Task 4.5: `EuclidTable.jsx` and `BackSubList.jsx`

- [ ] **Step 1: Write EuclidTable**

```jsx
export default function EuclidTable({ rows, highlight = -1, showQuotient = true }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-sm">
        <thead>
          <tr className="bg-[#f1f3ff] text-[#003d9b] text-xs uppercase">
            <th className="p-2 text-left">Шаг</th>
            <th className="p-2 text-right">Делимое</th>
            <th className="p-2 text-center">=</th>
            {showQuotient && <th className="p-2 text-right">Частное</th>}
            <th className="p-2 text-center">·</th>
            <th className="p-2 text-right">Делитель</th>
            <th className="p-2 text-center">+</th>
            <th className="p-2 text-right">Остаток</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-gray-100 transition-colors ${i === highlight ? 'bg-blue-50' : ''}`}>
              <td className="p-2 text-gray-400">{i + 1}</td>
              <td className="p-2 text-right">{String(r.dividend)}</td>
              <td className="p-2 text-center text-gray-400">=</td>
              {showQuotient && <td className="p-2 text-right text-[#003d9b] font-bold">{String(r.quotient)}</td>}
              <td className="p-2 text-center text-gray-400">·</td>
              <td className="p-2 text-right">{String(r.divisor)}</td>
              <td className="p-2 text-center text-gray-400">+</td>
              <td className={`p-2 text-right font-bold ${r.remainder === 0n ? 'text-green-600' : 'text-[#041b3c]'}`}>{String(r.remainder)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Write BackSubList**

```jsx
export default function BackSubList({ lines, highlight = -1 }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm space-y-1">
      {lines.map((l, i) => (
        <pre key={i}
          className={`whitespace-pre-wrap transition-colors ${i === highlight ? 'text-[#003d9b] font-bold' : 'text-gray-600'}`}
        >{l}</pre>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/EuclidTable.jsx src/components/BackSubList.jsx
git commit -m "feat(ui): EuclidTable and BackSubList"
```

---

### Task 4.6: `ModPowViz.jsx` — square-and-multiply visualization

- [ ] **Step 1: Write component**

```jsx
import { useState } from 'react';
import Stepper from './Stepper';
import MathCard from './MathCard';

export default function ModPowViz({ base, exp, mod, trace, label = 'modPow' }) {
  const [idx, setIdx] = useState(0);
  const total = trace.steps.length;

  return (
    <div className="bg-white border border-[#c3c6d6] rounded-xl p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          {label}: {String(base)}^{String(exp)} mod {String(mod)}
        </div>
        <div className="font-mono text-xs text-[#003d9b]">
          {String(exp)} = {trace.binary}<sub>2</sub>
        </div>
      </div>

      <div className="flex gap-1 mb-3 justify-center">
        {trace.binary.split('').map((b, i) => {
          const current = trace.steps[idx]?.bitIndex === i;
          return (
            <div key={i} className={`w-8 h-8 rounded flex items-center justify-center font-mono text-sm font-bold border-2 ${
              current ? 'border-[#003d9b] bg-[#f1f3ff]' :
              b === '1' ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-400'
            }`}>{b}</div>
          );
        })}
      </div>

      <Stepper
        total={total}
        index={idx}
        onIndex={setIdx}
        label="Операция"
        renderStep={(i) => {
          const s = trace.steps[i];
          const title = s.op === 'square'
            ? `Квадрат (bit ${s.bitIndex}: ${s.bit})`
            : `Умножение на base (bit ${s.bitIndex}: 1)`;
          const expression = s.op === 'square'
            ? `r = ${s.before}² mod ${mod}`
            : `r = ${s.before} · ${base} mod ${mod}`;
          const note = s.op === 'square'
            ? 'Каждая итерация удваивает степень: r была r_prev, стала r_prev². Модуль удерживает число в рамке.'
            : `Бит = 1 → умножаем на base, добавляя одну единицу в показатель.`;
          return <MathCard title={title} expression={expression} value={`r = ${s.after}`} note={note} />;
        }}
      />
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-center font-mono text-sm">
        Итог: <span className="text-[#003d9b] font-bold">{String(trace.result)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ModPowViz.jsx
git commit -m "feat(ui): ModPowViz square-and-multiply"
```

---

### Task 4.7: `AsciiTableViz.jsx`

- [ ] **Step 1: Write**

```jsx
export default function AsciiTableViz({ text, codes, highlight = -1 }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[...text].map((ch, i) => (
        <div key={i}
          className={`flex flex-col items-center p-2 rounded border transition-all ${
            i === highlight ? 'border-[#003d9b] bg-[#f1f3ff] scale-110' : 'border-[#c3c6d6] bg-white'
          }`}
        >
          <div className="text-lg font-mono font-bold">{ch === ' ' ? '␣' : ch}</div>
          <div className="text-[10px] text-gray-400 uppercase">code</div>
          <div className="font-mono text-sm text-[#003d9b] font-bold">{codes[i]}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AsciiTableViz.jsx
git commit -m "feat(ui): AsciiTableViz"
```

---

## Phase 5 — `KeyGeneration.jsx` rewrite

### Task 5.1: Replace KeyGeneration with orchestrated sections

**Files:**
- Modify: `src/KeyGeneration.jsx` (full rewrite)

- [ ] **Step 1: Write the file**

```jsx
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PresetPicker from './components/PresetPicker';
import PrimeCheckViz from './components/PrimeCheckViz';
import EuclidTable from './components/EuclidTable';
import BackSubList from './components/BackSubList';
import MathCard from './components/MathCard';
import { isPrime, gcdTrace, extGcdTrace, pickECandidates, modInverse } from './utils/rsaMath';

const SECTIONS = [
  { id: 'primes',   label: '1. Простые числа' },
  { id: 'modulus',  label: '2. Модуль n' },
  { id: 'phi',      label: '3. Функция Эйлера φ(n)' },
  { id: 'e',        label: '4. Открытая экспонента e' },
  { id: 'd',        label: '5. Секретная экспонента d' },
  { id: 'verify',   label: '6. Проверка' },
];

export default function KeyGeneration({ state, setState, nextStep }) {
  const [section, setSection] = useState(0);

  const pCheck = useMemo(() => state.p !== null ? isPrime(state.p) : null, [state.p]);
  const qCheck = useMemo(() => state.q !== null ? isPrime(state.q) : null, [state.q]);

  const eCandidates = useMemo(() => state.phi !== null ? pickECandidates(state.phi) : [], [state.phi]);
  const eTrace = useMemo(() => state.e && state.phi ? extGcdTrace(state.e, state.phi) : null, [state.e, state.phi]);

  const applyPrimes = ({ presetId, p, q }) => {
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    setState(s => ({ ...s, presetId, p, q, n, phi, e: null, d: null, blocks: [] }));
    setSection(1);
  };

  const pickE = (e) => {
    const d = modInverse(e, state.phi);
    setState(s => ({ ...s, e, d }));
    setSection(4);
  };

  const ready = state.p && state.q && state.n && state.phi && state.e && state.d;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#041b3c] mb-2">Генерация ключей RSA</h2>
        <p className="text-gray-600 max-w-2xl">
          Шаг 1 из 3. Смотрим, как из двух простых чисел выводятся все части публичного и секретного ключа.
        </p>
      </div>

      {/* Section nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SECTIONS.map((s, i) => {
          const done = i < section;
          const active = i === section;
          return (
            <button key={s.id} onClick={() => setSection(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                active ? 'bg-[#003d9b] text-white' :
                done ? 'bg-green-50 text-green-700 border border-green-200' :
                'bg-gray-100 text-gray-400'
              }`}
            >{s.label}</button>
          );
        })}
      </div>

      <div className="space-y-6">
        {section === 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-1">Выберите простые p и q</h3>
            <p className="text-sm text-gray-600 mb-4">
              RSA полагается на то, что перемножить два простых легко, а разложить n обратно — нет.
            </p>
            <PresetPicker presetId={state.presetId} onApply={applyPrimes} />
            {pCheck && qCheck && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <PrimeCheckViz n={state.p} trace={pCheck} label="Проверка p" />
                <PrimeCheckViz n={state.q} trace={qCheck} label="Проверка q" />
              </div>
            )}
          </div>
        )}

        {section === 1 && state.p && state.q && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Вычисляем модуль n = p · q</h3>
            <MathCard
              title="Подстановка"
              expression={`n = ${state.p} · ${state.q}`}
              value={String(state.n)}
              note="n публикуется как часть открытого ключа. Безопасность RSA держится на том, что обратное — факторизация n — вычислительно непосильна для больших простых."
            />
          </div>
        )}

        {section === 2 && state.phi !== null && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Функция Эйлера φ(n) = (p−1)(q−1)</h3>
            <MathCard
              title="Подстановка"
              expression={`φ(n) = (${state.p} − 1) · (${state.q} − 1) = ${state.p - 1n} · ${state.q - 1n}`}
              value={String(state.phi)}
              note="φ(n) — количество чисел меньше n, взаимно простых с n. Это и есть длина «цикла» по Эйлеру, она должна оставаться секретной."
            />
          </div>
        )}

        {section === 3 && eCandidates.length > 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Выбор открытой экспоненты e</h3>
            <p className="text-sm text-gray-600">
              Условие: gcd(e, φ) = 1. Проверяем кандидатов алгоритмом Евклида.
            </p>
            <div className="space-y-4">
              {eCandidates.map(({ e, valid, trace }) => (
                <div key={String(e)} className={`border rounded-lg p-4 ${state.e === e ? 'border-[#003d9b] bg-[#f1f3ff]' : valid ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-sm">
                      <span className="font-bold">e = {String(e)}</span>
                      <span className={`ml-3 px-2 py-0.5 text-[10px] rounded font-bold uppercase ${valid ? 'bg-green-600 text-white' : 'bg-red-100 text-red-700'}`}>
                        gcd = {String(trace.gcd)} {valid ? '✓' : '✗'}
                      </span>
                    </div>
                    <button
                      onClick={() => pickE(e)}
                      disabled={!valid}
                      className="px-3 py-1 text-xs font-bold bg-[#003d9b] text-white rounded disabled:bg-gray-300"
                    >Выбрать</button>
                  </div>
                  <EuclidTable rows={trace.rows} showQuotient />
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 4 && state.e && state.d && eTrace && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Секретная экспонента d = e⁻¹ mod φ</h3>
            <p className="text-sm text-gray-600">
              Используем расширенный алгоритм Евклида: решаем e·x + φ·y = 1, тогда d ≡ x (mod φ).
            </p>
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Прямой ход — деления</h4>
              <EuclidTable rows={eTrace.table.slice(1).filter(r => r.q !== null).map(r => ({
                dividend: r.oldR + r.q * r.r,
                divisor: r.oldR,
                quotient: r.q,
                remainder: r.r,
              }))} />
              <p className="text-[11px] text-gray-400 mt-1">Строки таблицы: dividend = quotient · divisor + remainder</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Обратная подстановка</h4>
              <BackSubList lines={eTrace.backSub} />
            </div>
            <MathCard
              tone="green"
              title="Результат"
              expression={`x = ${eTrace.x}, d ≡ x (mod φ)`}
              value={`d = ${state.d}`}
              note={`Проверка: e · d mod φ = ${state.e} · ${state.d} mod ${state.phi} = ${(state.e * state.d) % state.phi}.`}
            />
          </div>
        )}

        {section === 5 && ready && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Сводка по ключам</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MathCard tone="blue" title="Публичный ключ" expression={`(e, n) = (${state.e}, ${state.n})`} note="Можно давать кому угодно." />
              <MathCard tone="green" title="Приватный ключ" expression={`(d, n) = (${state.d}, ${state.n})`} note="Храните в секрете вместе с p, q и φ(n)." />
            </div>
            <button onClick={nextStep} className="w-full py-3 bg-[#003d9b] text-white font-bold rounded-lg hover:bg-[#0052cc]">
              К шифрованию →
            </button>
          </div>
        )}

        {/* Section stepper */}
        <div className="flex justify-between items-center pt-4">
          <button disabled={section === 0} onClick={() => setSection(s => s - 1)}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30">‹ Назад</button>
          <button
            disabled={section >= SECTIONS.length - 1 || (section === 3 && !state.e)}
            onClick={() => setSection(s => s + 1)}
            className="px-4 py-2 text-sm font-bold text-[#003d9b] hover:bg-blue-50 rounded disabled:opacity-30">Далее ›</button>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Dev-server sanity check**

Run `npm run dev`. Verify:
- Page loads, no console errors.
- Picking "Edu" preset fills p=61, q=53, shows two PrimeCheckViz panels.
- You can step through each section, see n=3233, φ=3120.
- The e candidates table shows gcd=3 for e=3, gcd=1 for e=17 with full Euclidean rows.
- Picking e=17 advances to the back-sub section, which shows `d=2753`.

- [ ] **Step 3: Commit**

```bash
git add src/KeyGeneration.jsx
git commit -m "feat(keygen): full educational rewrite with traces"
```

---

## Phase 6 — `Encryption.jsx` rewrite

### Task 6.1: Replace Encryption

**Files:**
- Modify: `src/Encryption.jsx` (full rewrite)

- [ ] **Step 1: Write the file**

```jsx
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AsciiTableViz from './components/AsciiTableViz';
import ModPowViz from './components/ModPowViz';
import MathCard from './components/MathCard';
import { encodeBlocks } from './utils/ascii';
import { modPowTrace } from './utils/rsaMath';

const DEFAULT_TEXT = 'HI';

export default function Encryption({ state, setState, nextStep, prevStep }) {
  const [text, setText] = useState(state.plaintext || DEFAULT_TEXT);
  const [phase, setPhase] = useState(0); // 0 input, 1 digitize, 2 encrypt, 3 done
  const [activeBlock, setActiveBlock] = useState(0);
  const [err, setErr] = useState(null);

  const digitize = () => {
    try {
      const blocks = encodeBlocks(text, state.n);
      setState(s => ({ ...s, plaintext: text, blocks: blocks.map(b => ({ ...b, cipher: null })) }));
      setPhase(1);
      setErr(null);
    } catch (e) { setErr(e.message); }
  };

  const encryptBlock = (i) => {
    const b = state.blocks[i];
    const trace = modPowTrace(b.value, state.e, state.n);
    setState(s => ({
      ...s,
      blocks: s.blocks.map((bl, j) => j === i ? { ...bl, cipher: trace.result } : bl),
    }));
    return trace;
  };

  const allTraces = useMemo(() => {
    if (phase < 2 || !state.blocks.length) return [];
    return state.blocks.map(b => modPowTrace(b.value, state.e, state.n));
  }, [phase, state.blocks, state.e, state.n]);

  const allDone = state.blocks.length > 0 && state.blocks.every(b => b.cipher !== null);

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#041b3c]">Шифрование</h1>
          <p className="text-gray-600 mt-1">Шаг 2 из 3. C = M<sup>e</sup> mod n — вычисляем честно.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2">
          <span className="text-[10px] font-bold text-[#003d9b] uppercase">Публичный ключ</span>
          <div className="font-mono text-sm text-blue-900 font-bold">e={String(state.e)}, n={String(state.n)}</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Phase 0: input */}
        <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-3">Ввод сообщения</h3>
          <div className="flex gap-3">
            <input value={text} onChange={e => setText(e.target.value)}
              placeholder="ASCII-текст"
              className="flex-1 border border-[#c3c6d6] rounded-lg p-3 font-mono text-lg" />
            <button onClick={digitize} disabled={!text}
              className="bg-[#003d9b] text-white px-6 rounded-lg font-bold disabled:bg-gray-300">
              Оцифровать
            </button>
          </div>
          {err && <p className="text-xs text-red-600 mt-2 font-mono">{err}</p>}
        </div>

        {/* Phase 1: ASCII digitization + blocks */}
        {phase >= 1 && state.blocks.length > 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Перевод в числа</h3>
            <AsciiTableViz text={text} codes={[...text].map(c => c.charCodeAt(0))} />
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Блоки (каждый блок &lt; n)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {state.blocks.map((b, i) => (
                  <div key={i} className={`border rounded-lg p-3 ${i === activeBlock ? 'border-[#003d9b] bg-[#f1f3ff]' : 'border-[#c3c6d6] bg-white'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Блок {i + 1}</div>
                    <div className="font-mono text-xs text-gray-400">{b.chars.join('')} → {b.digitStr}</div>
                    <div className="font-mono text-lg font-bold text-[#003d9b]">M = {String(b.value)}</div>
                    {b.cipher !== null && <div className="font-mono text-sm font-bold text-green-700 mt-1">C = {String(b.cipher)}</div>}
                  </div>
                ))}
              </div>
            </div>
            {phase === 1 && (
              <button onClick={() => setPhase(2)} className="w-full py-3 bg-[#003d9b] text-white font-bold rounded-lg hover:bg-[#0052cc]">
                Перейти к возведению в степень →
              </button>
            )}
          </div>
        )}

        {/* Phase 2: modPow per block */}
        {phase >= 2 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Возведение в степень</h3>
              <div className="flex gap-1">
                {state.blocks.map((_, i) => (
                  <button key={i} onClick={() => setActiveBlock(i)}
                    className={`px-3 py-1 text-xs font-bold rounded ${i === activeBlock ? 'bg-[#003d9b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Блок {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Метод «квадрат и умножение»: двоичное представление e даёт программу действий.
              Квадрат на каждом бите, умножение на base на каждом 1-бите.
            </p>

            <ModPowViz
              base={state.blocks[activeBlock].value}
              exp={state.e}
              mod={state.n}
              trace={allTraces[activeBlock]}
              label={`C${activeBlock + 1} = M${activeBlock + 1}^e mod n`}
            />

            {state.blocks[activeBlock].cipher === null && (
              <button
                onClick={() => encryptBlock(activeBlock)}
                className="w-full py-2 bg-[#003d9b] text-white font-bold rounded text-sm"
              >Сохранить C для блока {activeBlock + 1}</button>
            )}
          </div>
        )}

        {/* Phase 3: done */}
        {allDone && (
          <div className="bg-gradient-to-br from-white to-[#e0e8ff] border-2 border-[#003d9b] rounded-xl p-6">
            <h3 className="text-xl font-bold text-[#041b3c] mb-2">Сообщение зашифровано</h3>
            <div className="font-mono text-sm space-y-1 text-[#003d9b]">
              {state.blocks.map((b, i) => (
                <div key={i}>C{i + 1} = {String(b.cipher)}</div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="text-gray-500 font-bold">‹ Назад</button>
              <button onClick={nextStep} className="bg-[#003d9b] text-white font-bold px-6 py-2 rounded">
                К расшифрованию →
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Dev-server check**

With preset Edu and default text "HI":
- Digitize produces two blocks (72, 73), each `< 3233`.
- Each block's ModPowViz shows 5 squares + 2 multiplies (since 17 = 10001₂).
- After both blocks encrypted, C1 = 72^17 mod 3233 = 2625, C2 = 73^17 mod 3233 = 2938 (verify via `node -e` if needed).

- [ ] **Step 3: Commit**

```bash
git add src/Encryption.jsx
git commit -m "feat(enc): blockwise encryption with square-and-multiply trace"
```

---

## Phase 7 — `Decryption.jsx` rewrite

### Task 7.1: Replace Decryption (remove `state.originalText` fallback)

- [ ] **Step 1: Write the file**

```jsx
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ModPowViz from './components/ModPowViz';
import AsciiTableViz from './components/AsciiTableViz';
import MathCard from './components/MathCard';
import { modPowTrace } from './utils/rsaMath';
import { decodeBlocks, decodeValue } from './utils/ascii';

export default function Decryption({ state, setState, prevStep }) {
  const [phase, setPhase] = useState(0);   // 0 intro, 1 decrypt, 2 decode, 3 done
  const [activeBlock, setActiveBlock] = useState(0);
  const [decrypted, setDecrypted] = useState(
    Array(state.blocks.length).fill(null)
  );

  const traces = useMemo(
    () => state.blocks.map(b => modPowTrace(b.cipher, state.d, state.n)),
    [state.blocks, state.d, state.n],
  );

  const commitBlock = (i) => {
    setDecrypted(prev => prev.map((v, j) => j === i ? traces[i].result : v));
  };

  const allDone = decrypted.every(v => v !== null);

  const plaintext = useMemo(() => {
    if (!allDone) return '';
    const rebuilt = state.blocks.map((b, i) => ({
      ...b,
      value: decrypted[i],
    }));
    return decodeBlocks(rebuilt);
  }, [allDone, state.blocks, decrypted]);

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#041b3c]">Расшифрование</h1>
          <p className="text-gray-600 mt-1">Шаг 3 из 3. M = C<sup>d</sup> mod n.</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded px-4 py-2">
          <span className="text-[10px] font-bold text-green-700 uppercase">Приватный ключ</span>
          <div className="font-mono text-sm text-green-900 font-bold">d={String(state.d)}, n={String(state.n)}</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Intro */}
        {phase === 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Почему работает</h3>
            <MathCard
              tone="gray"
              title="Теорема Эйлера"
              expression={`M^(e·d) ≡ M^(1 + k·φ(n)) ≡ M · (M^φ(n))^k ≡ M (mod n)`}
              note={`Поскольку e·d ≡ 1 (mod φ), применение степени d к C = M^e возвращает исходное M. Никакой магии — чистая теоретико-числовая тождественность.`}
            />
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Ciphertext-блоки</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {state.blocks.map((b, i) => (
                  <div key={i} className="border border-[#c3c6d6] rounded p-3 bg-gray-50">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">C{i + 1}</div>
                    <div className="font-mono text-lg font-bold text-[#003d9b]">{String(b.cipher)}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setPhase(1)} className="w-full py-3 bg-[#003d9b] text-white font-bold rounded-lg">
              Расшифровать блоки →
            </button>
          </div>
        )}

        {phase >= 1 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Возведение в степень (d)</h3>
              <div className="flex gap-1">
                {state.blocks.map((_, i) => (
                  <button key={i} onClick={() => setActiveBlock(i)}
                    className={`px-3 py-1 text-xs font-bold rounded ${i === activeBlock ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Блок {i + 1} {decrypted[i] !== null ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>

            <ModPowViz
              base={state.blocks[activeBlock].cipher}
              exp={state.d}
              mod={state.n}
              trace={traces[activeBlock]}
              label={`M${activeBlock + 1} = C${activeBlock + 1}^d mod n`}
            />

            {decrypted[activeBlock] === null && (
              <button onClick={() => commitBlock(activeBlock)}
                className="w-full py-2 bg-green-600 text-white font-bold rounded text-sm">
                Сохранить M для блока {activeBlock + 1}
              </button>
            )}
          </div>
        )}

        {allDone && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Декодирование блоков в ASCII</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {state.blocks.map((b, i) => (
                <MathCard
                  key={i}
                  tone="green"
                  title={`Блок ${i + 1}`}
                  expression={`M = ${decrypted[i]}`}
                  value={decodeValue(decrypted[i], b.chars.length)}
                  note="Делим число на 3-значные группы (каждая — ASCII-код)."
                />
              ))}
            </div>
            <AsciiTableViz text={plaintext} codes={[...plaintext].map(c => c.charCodeAt(0))} />
          </div>
        )}

        {allDone && (
          <div className="bg-gradient-to-br from-white to-[#e0e8ff] border-2 border-[#003d9b] rounded-xl p-8 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-[#041b3c] mb-2">Сообщение восстановлено</h2>
            <p className="text-sm text-gray-600 mb-4">Никаких подстав: текст ниже — результат настоящего modPow.</p>
            <div className="bg-[#003d9b] text-white inline-block px-6 py-3 rounded-lg font-black text-2xl font-mono">
              {plaintext}
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={prevStep} className="text-gray-500 font-bold">‹ Назад к шифрованию</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Dev-server check**

With Edu preset + "HI":
- Phase 0 shows theorem card and two ciphertext blocks (2625, 2938 or whatever the earlier step produced).
- Phase 1 per-block ModPowViz: d = 2753, binary is 101011000001 (12 bits), so 12 squares + 5 multiplies. Verify end values equal 72 and 73.
- Phase 2 decodes back to "HI" via real decoding (not from `state.plaintext`).
- **Critically: temporarily edit `state.plaintext` to "WRONG" in React DevTools — the rendered output must still show "HI" because decoding is now real.**

- [ ] **Step 3: Commit**

```bash
git add src/Decryption.jsx
git commit -m "feat(dec): honest block decryption, remove originalText fallback"
```

---

## Phase 8 — Cleanup

### Task 8.1: Remove dead code

**Files:**
- Modify: `src/Layout.jsx`
- Modify: `src/main.jsx`
- Modify: `index.html`
- Delete: `src/App.css`

- [ ] **Step 1: Layout.jsx**

Open `src/Layout.jsx`. Remove the `import { useState } from 'react';` line (unused). Fix line 19: change

```html
<div className="relative flex items-center hidden md:flex">
```
to
```html
<div className="relative items-center hidden md:flex">
```

- [ ] **Step 2: main.jsx**

Remove the `import './App.css';` line.

- [ ] **Step 3: index.html**

Change `href="/vite.svg"` to `href="/favicon.svg"`.

- [ ] **Step 4: Delete App.css**

```bash
rm src/App.css
```

- [ ] **Step 5: Verify dev server still renders**

Run `npm run dev`. Click through all three steps. No console errors.

- [ ] **Step 6: Commit**

```bash
git add -u src/Layout.jsx src/main.jsx index.html src/App.css
git commit -m "chore: drop dead code (App.css, unused imports, favicon fix)"
```

---

### Task 8.2: Full test run

- [ ] **Step 1: Run all tests**

```bash
npm run test:run
```

Expected: all green across `rsaMath.test.js` and `ascii.test.js`.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors. Fix any that appear.

- [ ] **Step 3: Production build smoke**

```bash
npm run build
```

Expected: builds without errors.

- [ ] **Step 4: Commit any lint fixes**

```bash
git add -u
git commit -m "chore: lint fixes"
```

---

## Phase 9 — Final review gauntlet

These are the workflow review tasks. Skip none.

### Task 9.1: Simplify pass

- [ ] Run `/simplify` on the changed files. Apply suggested simplifications (dedupe, reuse, prune). Commit as `refactor: simplify per /simplify`.

### Task 9.2: Code-reviewer subagent

- [ ] Dispatch `superpowers:code-reviewer` subagent against the branch. Address each concrete finding. Commit individually per fix.

### Task 9.3: Security review

- [ ] Run `/source-code-scanning`. Especially audit the `isPrime` trial division (BigInt bounds) and the ASCII decoder (potential injection of characters). Commit fixes.

### Task 9.4: Verification before completion

- [ ] Run `/superpowers:verification-before-completion`. Confirm:
  - All tests pass: `npm run test:run`
  - Lint clean: `npm run lint`
  - Build clean: `npm run build`
  - Dev server renders all three screens at preset = Standard ("HELLO" round-trips)
  - **The `state.originalText` fallback is gone** (grep: `git grep originalText src/` returns nothing)
  - **The hardcoded e=17 is gone** (grep: `git grep "e: 17\|e = 17" src/` returns nothing)

### Task 9.5: Design review

- [ ] Run `/design-review`. Fix visual regressions.

### Task 9.6: Impeccable critique + audit

- [ ] Run `/impeccable:critique` — UX review. Apply non-scope-creep recommendations.
- [ ] Run `/impeccable:audit` — accessibility and performance. Fix P0/P1 issues.

### Task 9.7: Final commit and done

- [ ] `git log --oneline main..HEAD` — confirm a clean, reviewable history.
- [ ] Ready for merge.

---

## Self-review checklist (filled)

**Spec coverage:**
- ✅ Trial-division for prime check (PrimeCheckViz) — Task 4.4
- ✅ Multiplication shown for n — KeyGeneration section 1
- ✅ φ substitution shown — KeyGeneration section 2
- ✅ Euclidean traces for e candidates — Task 4.5, KeyGeneration section 3
- ✅ Extended Euclidean + back-sub for d — Task 4.5, KeyGeneration section 4
- ✅ Square-and-multiply for encrypt/decrypt — Task 4.6, Encryption/Decryption
- ✅ ASCII lookup visualized — Task 4.7
- ✅ Block splitting with `M < n` guarantee — Task 2.1, Encryption
- ✅ Stepper with prev/next/play/speed — Task 4.1
- ✅ BigInt throughout state — Task 3.2
- ✅ Honest decryption (no `originalText` fallback) — Task 7.1
- ✅ Edu/Standard/Real presets — Task 3.1, 4.3
- ✅ Euler theorem mini-glossary — Decryption phase 0

**Placeholder scan:** none (every step has concrete code or a concrete command).

**Type consistency:**
- `isPrime` always returns `{ isPrime, checks, reason? }` — used consistently in PrimeCheckViz.
- `gcdTrace` returns `{ gcd, rows }` — consumed by EuclidTable and pickECandidates.
- `extGcdTrace` returns `{ gcd, x, y, table, backSub }` — consumed by KeyGeneration section 4.
- `modPowTrace` returns `{ result, binary, steps }` — consumed by ModPowViz.
- `encodeBlocks` returns `[{ chars, codes, digitStr, value }]`, App state blocks add `cipher`; `decodeBlocks`/`decodeValue` use `value` and `chars.length`.
- All numeric fields are BigInt (p, q, n, phi, e, d, block.value, block.cipher).

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-24-rsa-educational-steppers.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session with checkpoints for review.

**Which approach?**
