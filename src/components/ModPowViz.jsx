import { useState } from 'react';
import Stepper from './Stepper';
import MathCard from './MathCard';

export default function ModPowViz({ base, exp, mod, trace, label = 'modPow' }) {
  const [idx, setIdx] = useState(0);
  const total = trace.steps.length;

  return (
    <div style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)', borderRadius: '0.75rem', padding: '1rem' }}>
      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--t-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label}: {String(base)}^{String(exp)} mod {String(mod)}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--t-primary)' }}>
          {String(exp)} = {trace.binary}<sub>2</sub>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {trace.binary.split('').map((b, i) => {
          const current = trace.steps[idx]?.bitIndex === i;
          return (
            <div key={i} style={{
              width: '2rem', height: '2rem',
              borderRadius: '0.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700,
              border: `2px solid ${current ? 'var(--t-primary)' : b === '1' ? 'var(--t-border)' : 'var(--t-border)'}`,
              background: current ? 'var(--t-primary-bg)' : b === '1' ? 'var(--t-surface)' : 'var(--t-surface-alt)',
              color: b === '0' ? 'var(--t-text-muted)' : 'var(--t-text)',
            }}>{b}</div>
          );
        })}
      </div>

      <Stepper
        total={total}
        index={idx}
        onIndex={setIdx}
        label="Операция"
        renderStep={(i) => {
          const s = trace.steps[i];
          const title = s.op === 'square'
            ? `Квадрат (bit ${s.bitIndex}: ${s.bit})`
            : `Умножение на base (bit ${s.bitIndex}: 1)`;
          const expression = s.op === 'square'
            ? `r = ${s.before}² mod ${mod}`
            : `r = ${s.before} · ${base} mod ${mod}`;
          const note = s.op === 'square'
            ? 'Каждая итерация удваивает степень: r была r_prev, стала r_prev². Модуль удерживает число в рамке.'
            : `Бит = 1 → умножаем на base, добавляя одну единицу в показатель.`;
          return <MathCard title={title} expression={expression} value={`r = ${s.after}`} note={note} />;
        }}
      />
      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--t-primary-bg)', border: '1px solid var(--t-border)', borderRadius: '0.375rem', textAlign: 'center', fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--t-text)' }}>
        Итог: <span style={{ color: 'var(--t-primary)', fontWeight: 700 }}>{String(trace.result)}</span>
      </div>
    </div>
  );
}
