export default function AsciiTableViz({ text, codes, highlight = -1 }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {[...text].map((ch, i) => (
        <div key={i} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0.5rem',
          borderRadius: '0.375rem',
          border: `1px solid ${i === highlight ? 'var(--t-primary)' : 'var(--t-border)'}`,
          background: i === highlight ? 'var(--t-primary-bg)' : 'var(--t-surface)',
          transition: 'all 0.15s',
          transform: i === highlight ? 'scale(1.1)' : 'scale(1)',
        }}>
          <div style={{ fontSize: '1.125rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--t-text)' }}>{ch === ' ' ? '␣' : ch}</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--t-text-muted)', textTransform: 'uppercase' }}>code</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--t-primary)', fontWeight: 700 }}>{codes[i]}</div>
        </div>
      ))}
    </div>
  );
}
