import { useState } from 'react';
import Stepper from './Stepper';
import MathCard from './MathCard';

export default function PrimeCheckViz({ n, trace, label }) {
  const [idx, setIdx] = useState(0);
  const total = trace.checks.length;

  if (total === 0) {
    return <MathCard title={label} expression={`${n} needs no check`} tone="gray" />;
  }

  return (
    <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: '0.75rem', padding: '1rem' }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--t-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
        {label}: trial division for n = {String(n)}
      </div>
      <Stepper
        total={total}
        index={idx}
        onIndex={setIdx}
        label="Divisor"
        renderStep={(i) => {
          const c = trace.checks[i];
          const tone = c.divides ? 'red' : 'blue';
          const note = c.divides
            ? `Found a divisor — the number is composite.`
            : i === total - 1 && trace.isPrime
              ? `Reached √n without finding a divisor — the number is prime.`
              : `Does not divide. Move on.`;
          return (
            <MathCard
              title={`Check d = ${c.divisor}`}
              expression={`${n} mod ${c.divisor} = ${c.remainder}`}
              value={c.divides ? 'divides ✗' : 'does not divide ✓'}
              note={note}
              tone={tone}
            />
          );
        }}
      />
      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>
        Verdict: {trace.isPrime
          ? <span style={{ color: '#16a34a' }}>{String(n)} is prime ✓</span>
          : <span style={{ color: '#dc2626' }}>{String(n)} is composite ✗</span>}
      </div>
    </div>
  );
}
