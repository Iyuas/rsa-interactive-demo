import { useState } from 'react';
import Stepper from './Stepper';
import MathCard from './MathCard';

export default function PrimeCheckViz({ n, trace, label }) {
  const [idx, setIdx] = useState(0);
  const total = trace.checks.length;

  if (total === 0) {
    return <MathCard title={label} expression={`${n} проверка не нужна`} tone="gray" />;
  }

  return (
    <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: '0.75rem', padding: '1rem' }}>
      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--t-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
        {label}: Trial division для n = {String(n)}
      </div>
      <Stepper
        total={total}
        index={idx}
        onIndex={setIdx}
        label="Делитель"
        renderStep={(i) => {
          const c = trace.checks[i];
          const tone = c.divides ? 'red' : 'blue';
          const note = c.divides
            ? `Найден делитель — число составное.`
            : i === total - 1 && trace.isPrime
              ? `Дошли до √n без делителей — число простое.`
              : `Не делится. Продолжаем.`;
          return (
            <MathCard
              title={`Проверка d = ${c.divisor}`}
              expression={`${n} mod ${c.divisor} = ${c.remainder}`}
              value={c.divides ? 'делится ✗' : 'не делится ✓'}
              note={note}
              tone={tone}
            />
          );
        }}
      />
      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>
        Итог: {trace.isPrime
          ? <span style={{ color: '#16a34a' }}>{String(n)} — простое ✓</span>
          : <span style={{ color: '#dc2626' }}>{String(n)} — составное ✗</span>}
      </div>
    </div>
  );
}
