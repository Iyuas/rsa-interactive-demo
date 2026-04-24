import { useState } from 'react';
import Stepper from './Stepper';
import MathCard from './MathCard';

export default function ModPowViz({ base, exp, mod, trace, label = 'modPow' }) {
  const [idx, setIdx] = useState(0);
  const total = trace.steps.length;

  return (
    <div className="bg-white border border-[#c3c6d6] rounded-xl p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          {label}: {String(base)}^{String(exp)} mod {String(mod)}
        </div>
        <div className="font-mono text-xs text-[#003d9b]">
          {String(exp)} = {trace.binary}<sub>2</sub>
        </div>
      </div>

      <div className="flex gap-1 mb-3 justify-center flex-wrap">
        {trace.binary.split('').map((b, i) => {
          const current = trace.steps[idx]?.bitIndex === i;
          return (
            <div key={i} className={`w-8 h-8 rounded flex items-center justify-center font-mono text-sm font-bold border-2 ${
              current ? 'border-[#003d9b] bg-[#f1f3ff]' :
              b === '1' ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-400'
            }`}>{b}</div>
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
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-center font-mono text-sm">
        Итог: <span className="text-[#003d9b] font-bold">{String(trace.result)}</span>
      </div>
    </div>
  );
}
