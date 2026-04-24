export default function AsciiTableViz({ text, codes, highlight = -1 }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[...text].map((ch, i) => (
        <div key={i}
          className={`flex flex-col items-center p-2 rounded border transition-all ${
            i === highlight ? 'border-[#003d9b] bg-[#f1f3ff] scale-110' : 'border-[#c3c6d6] bg-white'
          }`}
        >
          <div className="text-lg font-mono font-bold">{ch === ' ' ? '␣' : ch}</div>
          <div className="text-[10px] text-gray-400 uppercase">code</div>
          <div className="font-mono text-sm text-[#003d9b] font-bold">{codes[i]}</div>
        </div>
      ))}
    </div>
  );
}
