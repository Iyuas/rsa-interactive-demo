export default function EuclidTable({ rows, highlight = -1, showQuotient = true }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: 'var(--t-primary-bg)', color: 'var(--t-primary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Step</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Dividend</th>
            <th style={{ padding: '0.5rem', textAlign: 'center' }}>=</th>
            {showQuotient && <th style={{ padding: '0.5rem', textAlign: 'right' }}>Quotient</th>}
            <th style={{ padding: '0.5rem', textAlign: 'center' }}>x</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Divisor</th>
            <th style={{ padding: '0.5rem', textAlign: 'center' }}>+</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Remainder</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--t-border)', background: i === highlight ? 'var(--t-primary-bg)' : 'transparent' }}>
              <td style={{ padding: '0.5rem', color: 'var(--t-text-muted)' }}>{i + 1}</td>
              <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--t-text)' }}>{String(r.dividend)}</td>
              <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--t-text-muted)' }}>=</td>
              {showQuotient && <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--t-primary)', fontWeight: 700 }}>{String(r.quotient)}</td>}
              <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--t-text-muted)' }}>x</td>
              <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--t-text)' }}>{String(r.divisor)}</td>
              <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--t-text-muted)' }}>+</td>
              <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: r.remainder === 0n ? '#16a34a' : 'var(--t-text)' }}>{String(r.remainder)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
