import { Fragment } from 'react';

// Visualizes Euclid's algorithm as a chain: each gcd(a, b) reduces to gcd(b, a mod b)
// until the remainder hits 0. Shows each step's division equation indented under the
// current pair, so the recursion is visually obvious.
export default function GcdSteps({ rows, showRule = true }) {
  if (!rows || rows.length === 0) return null;

  const finalGcd = rows[rows.length - 1].divisor;
  const isCoprime = finalGcd === 1n;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm">
      {showRule && (
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-sans">
          Правило: <span className="font-mono">gcd(a, b) = gcd(b, a mod b)</span>, пока b ≠ 0
        </p>
      )}
      <div className="space-y-0.5">
        <div className="text-[#041b3c] font-bold">
          gcd({String(rows[0].dividend)}, {String(rows[0].divisor)})
        </div>
        {rows.map((r, i) => {
          const isLast = i === rows.length - 1;
          const zero = r.remainder === 0n;
          return (
            <Fragment key={i}>
              <div className="pl-5 text-xs text-gray-500 py-0.5">
                <span className="text-gray-300 mr-1">↓</span>
                {String(r.dividend)} = {String(r.quotient)} · {String(r.divisor)} + {String(r.remainder)}
                {zero && <span className="ml-2 text-gray-400">— остаток 0, останавливаемся</span>}
              </div>
              {!isLast && (
                <div className="text-[#041b3c] font-bold">
                  gcd({String(r.divisor)}, {String(r.remainder)})
                </div>
              )}
            </Fragment>
          );
        })}
        <div className={`font-bold pt-1 ${isCoprime ? 'text-green-700' : 'text-red-700'}`}>
          gcd = {String(finalGcd)} {isCoprime ? '✓ взаимно простые' : '✗ есть общий делитель'}
        </div>
      </div>
    </div>
  );
}
