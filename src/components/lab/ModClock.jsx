import { useState, useEffect, useRef } from 'react';

// Modular clock for the mod n concept. Dial shows positions 0..n-1. The user
// sets a number a; the position a mod n is highlighted.
// Visual intuition: "the clock returns to the start every n steps".

export default function ModClock({ n = 7, onUnderstood, max = 50 }) {
  const [value, setValue] = useState(15);
  const reportedRef = useRef(false);

  const result = ((value % n) + n) % n;
  const wraps = Math.floor(value / n);
  const radius = 95;
  const positions = Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return {
      i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  useEffect(() => {
    if (wraps >= 2 && !reportedRef.current && onUnderstood) {
      reportedRef.current = true;
      onUnderstood();
    }
  }, [wraps, onUnderstood]);

  const accent = 'var(--t-primary)';
  const muted = 'var(--t-text-muted)';
  const surface = 'var(--t-surface-alt)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--t-text)' }}>
          a =
          <input
            type="number"
            min={0}
            max={max}
            value={value}
            onChange={(e) => setValue(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
            style={{
              width: '4rem',
              marginLeft: '0.4rem',
              padding: '0.3rem 0.5rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              border: '1px solid var(--t-border)',
              borderRadius: '0.375rem',
              background: 'var(--t-bg)',
              color: 'var(--t-text)',
            }}
          />
        </label>
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{ width: '14rem', accentColor: 'var(--t-primary)' }}
        />
        <span style={{ fontSize: '0.75rem', color: muted }}>n =</span>
        <input
          type="number"
          min={2}
          max={24}
          value={n}
          readOnly
          style={{
            width: '3rem',
            padding: '0.3rem 0.5rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            border: '1px solid var(--t-border)',
            borderRadius: '0.375rem',
            background: surface,
            color: 'var(--t-text-muted)',
          }}
        />
      </div>

      <div style={{ position: 'relative', width: 240, height: 240 }}>
        <svg viewBox="-120 -120 240 240" style={{ width: '100%', height: '100%' }}>
          <circle cx={0} cy={0} r={radius} fill="none" stroke="var(--t-border)" strokeWidth={1} />
          {positions.map(p => (
            <g key={p.i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.i === result ? 14 : 10}
                fill={p.i === result ? accent : surface}
                stroke="var(--t-border)"
                strokeWidth={1}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize={p.i === result ? 13 : 10}
                fontWeight={p.i === result ? 900 : 600}
                fill={p.i === result ? '#fff' : 'var(--t-text)'}
                fontFamily="monospace"
              >
                {p.i}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{
        background: 'var(--t-primary-bg)',
        border: `1px solid var(--t-border)`,
        borderRadius: '0.5rem',
        padding: '0.6rem 0.85rem',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        color: 'var(--t-text)',
        textAlign: 'center',
      }}>
        {value} = <span style={{ color: muted }}>{wraps} · {n}</span> + <span style={{ color: accent, fontWeight: 900 }}>{result}</span>
        <div style={{ fontSize: '0.75rem', color: muted, marginTop: '0.25rem' }}>
          {value} mod {n} = <span style={{ color: accent, fontWeight: 800 }}>{result}</span>
          {wraps > 0 && <> · the dial wrapped around <strong>{wraps}</strong> {wraps === 1 ? 'time' : 'times'}</>}
        </div>
      </div>
    </div>
  );
}
