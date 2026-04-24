export default function BackSubList({ steps, highlight = -1 }) {
  if (!steps || steps.length === 0) {
    return <div className="text-xs text-gray-400 italic">Нет шагов обратной подстановки.</div>;
  }
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm space-y-2">
      {steps.map((s, i) => (
        <div key={i} className={`transition-colors ${i === highlight ? 'text-[#003d9b] font-bold' : 'text-gray-600'}`}>
          <span className="text-gray-400 mr-2">{i === 0 ? 'gcd:' : 'подставляем:'}</span>
          {String(s.remainder)} = {String(s.dividend)} − {String(s.quotient)}·{String(s.divisor)}
        </div>
      ))}
    </div>
  );
}
