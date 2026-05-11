import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PresetPicker from './components/PresetPicker';
import MathCard from './components/MathCard';
import AnswerCheck from './components/AnswerCheck';
import Calculator from './components/Calculator';
import EuclidTable from './components/EuclidTable';
import BackSubList from './components/BackSubList';
import { gcdTrace, extGcdTrace, modInverse } from './utils/rsaMath';

const SECTIONS = [
  { id: 'primes', label: '1. Primes' },
  { id: 'modulus', label: '2. n' },
  { id: 'phi', label: '3. phi(n)' },
  { id: 'e', label: '4. e' },
  { id: 'd', label: '5. d' },
  { id: 'summary', label: '6. Keys' },
];

const card = {
  background: 'var(--t-surface)',
  border: '1px solid var(--t-border)',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const normalizeNumber = (value) => value.replace(/\s+/g, '').trim();

const findValidPublicExponent = (phi) => {
  const options = findValidPublicExponents(phi, 1);
  return options[0] || 2n;
};

const findValidPublicExponents = (phi, limit = 5) => {
  const options = [];
  const seen = new Set();
  const add = (e) => {
    if (options.length >= limit || seen.has(String(e))) return;
    if (e > 1n && e < phi && gcdTrace(e, phi).gcd === 1n) {
      options.push(e);
      seen.add(String(e));
    }
  };

  [7n, 5n, 11n, 17n, 257n, 65537n, 3n].forEach(add);
  if (options.length >= limit) return options;

  for (let e = 3n; e < phi; e += 2n) {
    add(e);
    if (options.length >= limit) break;
  }

  return options;
};

export default function KeyGeneration({ state, setState, nextStep }) {
  const [section, setSection] = useState(0);
  const [progress, setProgress] = useState({ n: false, phi: false, e: false, d: false });

  const eTrace = useMemo(
    () => (state.e && state.phi ? gcdTrace(state.e, state.phi) : null),
    [state.e, state.phi],
  );
  const dTrace = useMemo(
    () => (state.e && state.phi ? extGcdTrace(state.e, state.phi) : null),
    [state.e, state.phi],
  );
  const suggestedE = useMemo(
    () => (state.phi ? findValidPublicExponent(state.phi) : null),
    [state.phi],
  );
  const suggestedEOptions = useMemo(
    () => (state.phi ? findValidPublicExponents(state.phi, 5) : []),
    [state.phi],
  );

  const applyPrimes = ({ presetId, p, q }) => {
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    setState((s) => ({ ...s, presetId, p, q, n, phi, e: null, d: null, plaintext: '', blocks: [] }));
    setProgress({ n: false, phi: false, e: false, d: false });
    setSection(1);
  };

  const acceptE = (raw) => {
    const e = BigInt(normalizeNumber(raw));
    const d = modInverse(e, state.phi);
    setState((s) => ({ ...s, e, d }));
    setProgress((p) => ({ ...p, e: true, d: false }));
  };

  const acceptD = () => {
    setProgress((p) => ({ ...p, d: true }));
  };

  const ready = state.p && state.q && progress.n && progress.phi && progress.e && progress.d;
  const primary = 'var(--t-primary)';
  const textColor = 'var(--t-text)';
  const muted = 'var(--t-text-muted)';
  const border = 'var(--t-border)';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, marginBottom: '0.5rem', marginTop: 0 }}>RSA Key Generation</h2>
        <p style={{ color: muted, maxWidth: '48rem', margin: 0 }}>
          Build the public and private keys yourself. The site checks each answer and can reveal the solution when you get stuck.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {SECTIONS.map((s, i) => {
          const active = i === section;
          return (
            <button key={s.id} onClick={() => setSection(i)} style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: `1px solid ${active ? primary : border}`,
              background: active ? primary : 'var(--t-surface-alt)',
              color: active ? '#fff' : muted,
              cursor: 'pointer',
            }}>{s.label}</button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 18rem', gap: '1rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {section === 0 && (
            <div style={card}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Choose two prime numbers</h3>
              <p style={{ fontSize: '0.875rem', color: muted, margin: 0 }}>
                RSA begins with p and q. Multiplying them is easy, but recovering p and q from n becomes hard when the primes are very large.
              </p>
              <PresetPicker onApply={applyPrimes} />
            </div>
          )}

          {section === 1 && state.p && state.q && (
            <div style={card}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Calculate n = p x q</h3>
              <MathCard title="Formula" expression={`n = ${state.p} x ${state.q}`} note="n becomes part of both the public key and the private key." />
              <AnswerCheck
                key={`n-${state.p}-${state.q}`}
                label="What is n?"
                hint="Multiply p by q."
                expected={state.n}
                normalize={normalizeNumber}
                formatSolution={() => `${state.p} x ${state.q} = ${state.n}`}
                onCorrect={() => setProgress((p) => ({ ...p, n: true }))}
              />
            </div>
          )}

          {section === 2 && state.phi !== null && (
            <div style={card}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Calculate phi(n)</h3>
              <MathCard title="Formula" expression={`phi(n) = (p - 1)(q - 1) = (${state.p} - 1)(${state.q} - 1)`} note="phi(n) counts how many numbers below n are coprime with n. In RSA it must stay secret." />
              <AnswerCheck
                key={`phi-${state.p}-${state.q}`}
                label="What is phi(n)?"
                hint="Subtract 1 from each prime, then multiply."
                expected={state.phi}
                normalize={normalizeNumber}
                formatSolution={() => `(${state.p} - 1) x (${state.q} - 1) = ${state.p - 1n} x ${state.q - 1n} = ${state.phi}`}
                onCorrect={() => setProgress((p) => ({ ...p, phi: true }))}
              />
            </div>
          )}

          {section === 3 && state.phi !== null && (
            <div style={card}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Choose the public exponent e</h3>
              <p style={{ color: muted, margin: 0, fontSize: '0.875rem' }}>
                e must satisfy 1 &lt; e &lt; phi(n), and gcd(e, phi(n)) must be 1. That means e and phi(n) share no divisor except 1.
              </p>
              <AnswerCheck
                key={`e-${state.phi}`}
                label="Enter a valid e"
                hint="For example, try a small odd number and check gcd(e, phi(n))."
                expected="any valid e"
                validate={(raw) => {
                  try {
                    const e = BigInt(normalizeNumber(raw));
                    return e > 1n && e < state.phi && gcdTrace(e, state.phi).gcd === 1n;
                  } catch {
                    return false;
                  }
                }}
                solutionValue={suggestedE}
                formatSolution={() => {
                  const rows = suggestedEOptions.map((e) => `e = ${e}, gcd(${e}, ${state.phi}) = ${gcdTrace(e, state.phi).gcd}`);
                  return `Good starter options:\n${rows.join('\n')}\n\nUsing e = ${suggestedE}.`;
                }}
                onCorrect={acceptE}
              />
              {state.e && eTrace && (
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: muted, textTransform: 'uppercase' }}>Euclidean check for e = {String(state.e)}</h4>
                  <EuclidTable rows={eTrace.rows} showQuotient />
                </div>
              )}
            </div>
          )}

          {section === 4 && state.e && state.d && dTrace && (
            <div style={card}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Find the private exponent d</h3>
              <p style={{ color: muted, margin: 0, fontSize: '0.875rem' }}>
                d is the modular inverse of e. In plain words: d is the number that makes e x d leave remainder 1 when divided by phi(n).
              </p>
              <MathCard title="Target" expression={`(e x d) mod phi(n) = (${state.e} x d) mod ${state.phi} = 1`} />
              <AnswerCheck
                key={`d-${state.e}-${state.phi}`}
                label="What is d?"
                hint="Find e^-1 mod phi(n)."
                expected={state.d}
                normalize={normalizeNumber}
                formatSolution={() => {
                  const equivalents = [state.d, state.d + state.phi, state.d + (2n * state.phi)];
                  return `Use the smallest positive value:\nd = ${state.d}, because (${state.e} x ${state.d}) mod ${state.phi} = ${(state.e * state.d) % state.phi}\n\nEquivalent values modulo phi(n):\n${equivalents.map((d) => `d = ${d}`).join('\n')}`;
                }}
                onCorrect={acceptD}
              />
              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: muted, textTransform: 'uppercase' }}>Back substitution</h4>
                <BackSubList steps={dTrace.backSub} />
              </div>
            </div>
          )}

          {section === 5 && state.e && state.d && (
            <div style={card}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Key summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <MathCard tone="blue" title="Public key" expression={`(e, n) = (${state.e}, ${state.n})`} note="Share this key. Others use it to encrypt messages for you." />
                <MathCard tone="green" title="Private key" expression={`(d, n) = (${state.d}, ${state.n})`} note="Keep this key secret. It decrypts the ciphertext." />
              </div>
              <button disabled={!ready} onClick={nextStep} style={{ width: '100%', padding: '0.75rem', background: ready ? primary : '#9ca3af', color: '#fff', fontWeight: 800, borderRadius: '0.5rem', border: 'none', cursor: ready ? 'pointer' : 'not-allowed', fontSize: '0.875rem' }}>
                Go to encryption
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
            <button disabled={section === 0} onClick={() => setSection((s) => s - 1)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 800, color: section === 0 ? muted : textColor, background: 'none', border: 'none', cursor: section === 0 ? 'not-allowed' : 'pointer', opacity: section === 0 ? 0.4 : 1 }}>Back</button>
            <button disabled={section >= SECTIONS.length - 1 || (section === 0 && !state.p)} onClick={() => setSection((s) => s + 1)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 800, color: primary, background: 'none', border: 'none', cursor: 'pointer', opacity: section >= SECTIONS.length - 1 || (section === 0 && !state.p) ? 0.4 : 1 }}>Next</button>
          </div>
        </div>
        <Calculator />
      </div>
    </motion.div>
  );
}
