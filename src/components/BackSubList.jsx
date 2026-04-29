export default function BackSubList({ steps, highlight = -1 }) {
  if (!steps || steps.length === 0) {
    return <div style={{ fontSize: '0.75rem', color: 'var(--t-text-muted)', fontStyle: 'italic' }}>Нет шагов обратной подстановки.</div>;
  }
  return (
    <div style={{ background: 'var(--t-surface-alt)', border: '1px solid var(--t-border)', borderRadius: '0.5rem', padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ color: i === highlight ? 'var(--t-primary)' : 'var(--t-text-muted)', fontWeight: i === highlight ? 700 : 400 }}>
          <span style={{ color: 'var(--t-text-muted)', marginRight: '0.5rem' }}>{i === 0 ? 'gcd:' : 'подставляем:'}</span>
          {String(s.remainder)} = {String(s.dividend)} − {String(s.quotient)}·{String(s.divisor)}
        </div>
      ))}
    </div>
  );
}
