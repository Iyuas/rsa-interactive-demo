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
    <div className="bg-white border border-[#c3c6d6] rounded-xl p-4 shadow-sm">
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
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
      <div className="mt-3 text-xs font-bold text-center">
        Итог: {trace.isPrime
          ? <span className="text-green-600">{String(n)} — простое ✓</span>
          : <span className="text-red-600">{String(n)} — составное ✗</span>}
      </div>
    </div>
  );
}
