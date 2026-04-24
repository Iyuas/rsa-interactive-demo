export default function EuclidTable({ rows, highlight = -1, showQuotient = true }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-sm">
        <thead>
          <tr className="bg-[#f1f3ff] text-[#003d9b] text-xs uppercase">
            <th className="p-2 text-left">Шаг</th>
            <th className="p-2 text-right">Делимое</th>
            <th className="p-2 text-center">=</th>
            {showQuotient && <th className="p-2 text-right">Частное</th>}
            <th className="p-2 text-center">·</th>
            <th className="p-2 text-right">Делитель</th>
            <th className="p-2 text-center">+</th>
            <th className="p-2 text-right">Остаток</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-gray-100 transition-colors ${i === highlight ? 'bg-blue-50' : ''}`}>
              <td className="p-2 text-gray-400">{i + 1}</td>
              <td className="p-2 text-right">{String(r.dividend)}</td>
              <td className="p-2 text-center text-gray-400">=</td>
              {showQuotient && <td className="p-2 text-right text-[#003d9b] font-bold">{String(r.quotient)}</td>}
              <td className="p-2 text-center text-gray-400">·</td>
              <td className="p-2 text-right">{String(r.divisor)}</td>
              <td className="p-2 text-center text-gray-400">+</td>
              <td className={`p-2 text-right font-bold ${r.remainder === 0n ? 'text-green-600' : 'text-[#041b3c]'}`}>{String(r.remainder)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
