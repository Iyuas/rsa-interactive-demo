import { useState } from 'react';
import { isPrime } from '../utils/rsaMath';

const DEFAULT_P = '61';
const DEFAULT_Q = '53';
const PRIME_OPTIONS = [
  { p: '61', q: '53', note: 'classic small RSA demo' },
  { p: '47', q: '71', note: 'small and readable' },
  { p: '89', q: '97', note: 'a little larger' },
  { p: '101', q: '113', note: 'still easy to calculate' },
];

function PrimeStatus({ name, value }) {
  if (!value.trim()) return null;

  let message;
  let color = '#dc2626';

  try {
    const n = BigInt(value);
    const check = isPrime(n);
    const ok = check.isPrime;
    color = ok ? '#15803d' : '#dc2626';
    message = `${name} = ${String(n)} is ${ok ? 'prime.' : 'not prime. Find a number that is divisible only by 1 and itself.'}`;
  } catch {
    message = `${name} must be a whole number.`;
  }

  return <div style={{ fontSize: '0.8125rem', color, fontWeight: 700 }}>{message}</div>;
}

export default function PresetPicker({ onApply }) {
  const [pInput, setPInput] = useState(DEFAULT_P);
  const [qInput, setQInput] = useState(DEFAULT_Q);
  const [err, setErr] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const applyManual = () => {
    try {
      const p = BigInt(pInput);
      const q = BigInt(qInput);
      if (p === q) throw new Error('p and q must be different.');
      if (!isPrime(p).isPrime) throw new Error(`p=${p} is not prime. Try a number divisible only by 1 and itself.`);
      if (!isPrime(q).isPrime) throw new Error(`q=${q} is not prime. Try a number divisible only by 1 and itself.`);
      if (p * q < 128n) throw new Error('p x q must be at least 128 so every ASCII character fits below n.');
      onApply({ presetId: 'custom', p, q });
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: 'var(--t-primary-bg)', border: '1px solid var(--t-border)', borderRadius: '0.5rem', padding: '1rem' }}>
        <strong style={{ color: 'var(--t-text)' }}>Prime numbers</strong>
        <p style={{ color: 'var(--t-text-muted)', margin: '0.35rem 0 0', fontSize: '0.875rem', lineHeight: 1.5 }}>
          A prime number is a whole number greater than 1 that can be divided only by 1 and itself. RSA starts with two different prime numbers, called p and q.
        </p>
      </div>
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input value={pInput} onChange={(e) => setPInput(e.target.value)} placeholder="p (prime)"
            style={{ border: '1px solid var(--t-border)', borderRadius: '0.375rem', padding: '0.65rem', fontFamily: 'monospace', fontSize: '0.875rem', background: 'var(--t-bg)', color: 'var(--t-text)', outline: 'none' }} />
          <input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="q (prime)"
            style={{ border: '1px solid var(--t-border)', borderRadius: '0.375rem', padding: '0.65rem', fontFamily: 'monospace', fontSize: '0.875rem', background: 'var(--t-bg)', color: 'var(--t-text)', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.75rem' }}>
          <PrimeStatus name="p" value={pInput} />
          <PrimeStatus name="q" value={qInput} />
        </div>
        <button onClick={applyManual} disabled={!pInput || !qInput} style={{
          marginTop: '0.75rem', width: '100%', padding: '0.65rem',
          background: (pInput && qInput) ? 'var(--t-primary)' : '#9ca3af',
          color: '#fff', borderRadius: '0.375rem', fontWeight: 800, fontSize: '0.8125rem',
          border: 'none', cursor: (pInput && qInput) ? 'pointer' : 'not-allowed',
        }}>Use these primes</button>
        <button onClick={() => setShowOptions((showing) => !showing)} style={{
          marginTop: '0.5rem', width: '100%', padding: '0.65rem',
          background: 'var(--t-surface)', color: 'var(--t-primary)',
          borderRadius: '0.375rem', fontWeight: 800, fontSize: '0.8125rem',
          border: '1px solid var(--t-border)', cursor: 'pointer',
        }}>{showOptions ? 'Hide prime options' : 'Show prime options'}</button>
        {showOptions && (
          <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
            {PRIME_OPTIONS.map((option) => (
              <button
                key={`${option.p}-${option.q}`}
                onClick={() => {
                  setPInput(option.p);
                  setQInput(option.q);
                  setErr(null);
                }}
                style={{
                  border: '1px solid var(--t-border)',
                  borderRadius: '0.375rem',
                  padding: '0.65rem',
                  background: 'var(--t-primary-bg)',
                  color: 'var(--t-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontFamily: 'monospace', fontWeight: 800 }}>p = {option.p}, q = {option.q}</div>
                <div style={{ color: 'var(--t-text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{option.note}</div>
              </button>
            ))}
          </div>
        )}
        {err && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontFamily: 'monospace' }}>{err}</p>}
      </div>
    </div>
  );
}
