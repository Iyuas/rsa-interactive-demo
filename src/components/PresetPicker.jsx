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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
        {Object.values(PRESETS).map(p => (
          <button key={p.id} onClick={() => applyPreset(p.id)} style={{
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${presetId === p.id ? 'var(--t-primary)' : 'var(--t-border)'}`,
            background: presetId === p.id ? 'var(--t-primary-bg)' : 'var(--t-surface)',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--t-text)' }}>{p.label}</div>
            <div style={{ fontSize: '0.625rem', color: 'var(--t-text-muted)', marginTop: '0.25rem' }}>{p.description}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.625rem', color: 'var(--t-primary)', marginTop: '0.5rem' }}>p={String(p.p)}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.625rem', color: 'var(--t-primary)' }}>q={String(p.q)}</div>
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--t-border)', paddingTop: '1rem' }}>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--t-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Ручной ввод</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input value={pInput} onChange={e => setPInput(e.target.value)} placeholder="p (prime)"
            style={{ border: '1px solid var(--t-border)', borderRadius: '0.375rem', padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem', background: 'var(--t-bg)', color: 'var(--t-text)', outline: 'none' }} />
          <input value={qInput} onChange={e => setQInput(e.target.value)} placeholder="q (prime)"
            style={{ border: '1px solid var(--t-border)', borderRadius: '0.375rem', padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem', background: 'var(--t-bg)', color: 'var(--t-text)', outline: 'none' }} />
        </div>
        <button onClick={applyManual} disabled={!pInput || !qInput} style={{
          marginTop: '0.5rem', width: '100%', padding: '0.5rem',
          background: (pInput && qInput) ? 'var(--t-primary)' : '#9ca3af',
          color: '#fff', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.75rem',
          border: 'none', cursor: (pInput && qInput) ? 'pointer' : 'not-allowed',
        }}>Проверить и применить</button>
        {err && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontFamily: 'monospace' }}>{err}</p>}
      </div>
    </div>
  );
}
