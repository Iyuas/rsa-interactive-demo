import { useState } from 'react';
import { modPowTrace } from '../utils/rsaMath';

const buttonStyle = {
  border: '1px solid var(--t-border)',
  borderRadius: '0.375rem',
  padding: '0.55rem',
  background: 'var(--t-surface)',
  color: 'var(--t-text)',
  fontWeight: 800,
  cursor: 'pointer',
};

export default function Calculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const append = (token) => {
    setExpr((e) => `${e}${token}`);
    setResult('');
    setError('');
  };

  const calculate = () => {
    const compact = expr.replace(/\s+/g, '');
    try {
      const modPowMatch = compact.match(/^(\d+)\^(\d+)%(\d+)$/);
      if (modPowMatch) {
        const [, base, exp, mod] = modPowMatch;
        setResult(String(modPowTrace(BigInt(base), BigInt(exp), BigInt(mod)).result));
        return;
      }

      if (!/^[\d+\-*/%() ]+$/.test(expr)) throw new Error('Use numbers and calculator operators only.');
      const value = Function(`"use strict"; return (${expr})`)();
      if (!Number.isFinite(value)) throw new Error('The expression did not produce a finite number.');
      setResult(String(value));
    } catch (e) {
      setError(e.message || 'Could not calculate this expression.');
    }
  };

  return (
    <aside style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--t-primary)', textTransform: 'uppercase' }}>Calculator</div>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--t-text-muted)', fontSize: '0.75rem', lineHeight: 1.45 }}>
          Write modular powers as x^y%z. The app evaluates them with fast modular exponentiation when you press equals.
        </p>
      </div>
      <input
        value={expr}
        onChange={(e) => { setExpr(e.target.value); setResult(''); setError(''); }}
        placeholder="65^17%3233"
        style={{ border: '1px solid var(--t-border)', borderRadius: '0.375rem', padding: '0.7rem', fontFamily: 'monospace', background: 'var(--t-bg)', color: 'var(--t-text)' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '^', '%', '+'].map((token) => (
          <button key={token} onClick={() => append(token)} style={buttonStyle}>{token}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <button onClick={() => { setExpr(''); setResult(''); setError(''); }} style={{ ...buttonStyle, color: 'var(--t-text-muted)' }}>Clear</button>
        <button onClick={calculate} style={{ ...buttonStyle, background: 'var(--t-primary)', color: '#fff', borderColor: 'var(--t-primary)' }}>=</button>
      </div>
      {result && <div style={{ padding: '0.75rem', background: 'var(--t-primary-bg)', borderRadius: '0.375rem', fontFamily: 'monospace', fontWeight: 900, color: 'var(--t-primary)', overflowX: 'auto' }}>{result}</div>}
      {error && <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</div>}
    </aside>
  );
}
