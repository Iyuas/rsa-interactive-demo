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

  const btnBase = {
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    border: '1px solid var(--t-border)',
    background: 'var(--t-surface)',
    color: 'var(--t-text)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--t-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label} {index + 1} / {total}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => onIndex(i => Math.max(0, i - 1))} disabled={index === 0}
            style={{ ...btnBase, opacity: index === 0 ? 0.4 : 1 }}>‹ Назад</button>
          <button onClick={() => setPlaying(p => !p)}
            style={{ ...btnBase, background: 'var(--t-primary)', color: '#fff', border: 'none' }}>
            {playing ? '⏸ Пауза' : '▶ Авто'}
          </button>
          <button onClick={() => onIndex(i => Math.min(total - 1, i + 1))} disabled={index >= total - 1}
            style={{ ...btnBase, opacity: index >= total - 1 ? 0.4 : 1 }}>Далее ›</button>
          <div style={{ display: 'flex', border: '1px solid var(--t-border)', borderRadius: '0.375rem', overflow: 'hidden', marginLeft: '0.5rem' }}>
            {SPEEDS.map((s, i) => (
              <button key={s.label} onClick={() => setSpeedIdx(i)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.625rem', fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: i === speedIdx ? 'var(--t-primary)' : 'var(--t-surface)',
                  color: i === speedIdx ? '#fff' : 'var(--t-text-muted)' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width: '100%', background: 'var(--t-border)', borderRadius: '999px', height: '4px', overflow: 'hidden' }}>
        <div style={{ background: 'var(--t-primary)', height: '100%', transition: 'width 0.3s', width: `${((index + 1) / total) * 100}%` }} />
      </div>
      <div>{renderStep(index)}</div>
    </div>
  );
}
