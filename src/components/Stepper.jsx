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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          {label} {index + 1} / {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onIndex(i => Math.max(0, i - 1))}
            disabled={index === 0}
            className="px-3 py-1.5 rounded border border-[#c3c6d6] text-xs font-bold disabled:opacity-40 hover:bg-gray-50"
          >‹ Назад</button>
          <button
            onClick={() => setPlaying(p => !p)}
            className="px-3 py-1.5 rounded bg-[#003d9b] text-white text-xs font-bold hover:bg-[#0052cc]"
          >{playing ? '⏸ Пауза' : '▶ Авто'}</button>
          <button
            onClick={() => onIndex(i => Math.min(total - 1, i + 1))}
            disabled={index >= total - 1}
            className="px-3 py-1.5 rounded border border-[#c3c6d6] text-xs font-bold disabled:opacity-40 hover:bg-gray-50"
          >Далее ›</button>
          <div className="flex items-center gap-0.5 ml-2 border border-[#c3c6d6] rounded overflow-hidden">
            {SPEEDS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSpeedIdx(i)}
                className={`px-2 py-1 text-[10px] font-bold ${i === speedIdx ? 'bg-[#003d9b] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >{s.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
        <div
          className="bg-[#003d9b] h-full transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
      <div>{renderStep(index)}</div>
    </div>
  );
}
