import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PresetPicker from './components/PresetPicker';
import PrimeCheckViz from './components/PrimeCheckViz';
import EuclidTable from './components/EuclidTable';
import BackSubList from './components/BackSubList';
import MathCard from './components/MathCard';
import { isPrime, gcdTrace, extGcdTrace, pickECandidates, modInverse } from './utils/rsaMath';

const SECTIONS = [
  { id: 'primes',   label: '1. Простые числа' },
  { id: 'modulus',  label: '2. Модуль n' },
  { id: 'phi',      label: '3. Функция Эйлера φ(n)' },
  { id: 'e',        label: '4. Открытая экспонента e' },
  { id: 'd',        label: '5. Секретная экспонента d' },
  { id: 'verify',   label: '6. Проверка' },
];

// Trial-division visualization becomes impractical for primes above this threshold
// (sqrt(10000) = 100 check rows; anything larger freezes the UI while isPrime runs).
const PRIME_VIZ_THRESHOLD = 10000n;

export default function KeyGeneration({ state, setState, nextStep }) {
  const [section, setSection] = useState(0);

  const pCheck = useMemo(
    () => (state.p !== null && state.p <= PRIME_VIZ_THRESHOLD) ? isPrime(state.p) : null,
    [state.p],
  );
  const qCheck = useMemo(
    () => (state.q !== null && state.q <= PRIME_VIZ_THRESHOLD) ? isPrime(state.q) : null,
    [state.q],
  );

  const eCandidates = useMemo(
    () => state.phi !== null ? pickECandidates(state.phi) : [],
    [state.phi],
  );

  const eForwardTrace = useMemo(
    () => (state.e !== null && state.phi !== null) ? gcdTrace(state.phi, state.e) : null,
    [state.e, state.phi],
  );
  const eExtTrace = useMemo(
    () => (state.e !== null && state.phi !== null) ? extGcdTrace(state.e, state.phi) : null,
    [state.e, state.phi],
  );

  const applyPrimes = ({ presetId, p, q }) => {
    const n = p * q;
    const phi = (p - 1n) * (q - 1n);
    setState(s => ({ ...s, presetId, p, q, n, phi, e: null, d: null, blocks: [] }));
    setSection(1);
  };

  const pickE = (e) => {
    const d = modInverse(e, state.phi);
    setState(s => ({ ...s, e, d }));
    setSection(4);
  };

  const ready = state.p && state.q && state.n && state.phi && state.e && state.d;
  const bigPrimes = state.p !== null && state.p > PRIME_VIZ_THRESHOLD;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#041b3c] mb-2">Генерация ключей RSA</h2>
        <p className="text-gray-600 max-w-2xl">
          Шаг 1 из 3. Смотрим, как из двух простых чисел выводятся все части публичного и секретного ключа.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {SECTIONS.map((s, i) => {
          const done = i < section;
          const active = i === section;
          return (
            <button key={s.id} onClick={() => setSection(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                active ? 'bg-[#003d9b] text-white' :
                done ? 'bg-green-50 text-green-700 border border-green-200' :
                'bg-gray-100 text-gray-400'
              }`}
            >{s.label}</button>
          );
        })}
      </div>

      <div className="space-y-6">
        {section === 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-1">Выберите простые p и q</h3>
            <p className="text-sm text-gray-600 mb-4">
              RSA полагается на то, что перемножить два простых легко, а разложить n обратно — нет.
            </p>
            <PresetPicker presetId={state.presetId} onApply={applyPrimes} />
            {state.p !== null && state.q !== null && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {bigPrimes ? (
                  <>
                    <MathCard tone="green" title="p — большое простое"
                      expression={`p = ${state.p}`}
                      note="Простота проверена заранее (trial division на √p занял бы тысячи шагов — пропускаем для наглядности)." />
                    <MathCard tone="green" title="q — большое простое"
                      expression={`q = ${state.q}`}
                      note="Для Real-пресета демонстрируем, что RSA работает и на числах уровня 2³¹." />
                  </>
                ) : (
                  <>
                    {pCheck && <PrimeCheckViz n={state.p} trace={pCheck} label="Проверка p" />}
                    {qCheck && <PrimeCheckViz n={state.q} trace={qCheck} label="Проверка q" />}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {section === 1 && state.p && state.q && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Вычисляем модуль n = p · q</h3>
            <MathCard
              title="Подстановка"
              expression={`n = ${state.p} · ${state.q}`}
              value={String(state.n)}
              note="n публикуется как часть открытого ключа. Безопасность RSA держится на том, что обратное — факторизация n — вычислительно непосильна для больших простых."
            />
          </div>
        )}

        {section === 2 && state.phi !== null && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Функция Эйлера φ(n) = (p−1)(q−1)</h3>
            <MathCard
              title="Подстановка"
              expression={`φ(n) = (${state.p} − 1) · (${state.q} − 1) = ${state.p - 1n} · ${state.q - 1n}`}
              value={String(state.phi)}
              note="φ(n) — количество чисел меньше n, взаимно простых с n. Это и есть длина «цикла» по Эйлеру, она должна оставаться секретной."
            />
          </div>
        )}

        {section === 3 && eCandidates.length > 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Выбор открытой экспоненты e</h3>
            <p className="text-sm text-gray-600">
              Условие: gcd(e, φ) = 1. Проверяем кандидатов алгоритмом Евклида.
            </p>
            <div className="space-y-4">
              {eCandidates.map(({ e, valid, trace }) => (
                <div key={String(e)} className={`border rounded-lg p-4 ${state.e === e ? 'border-[#003d9b] bg-[#f1f3ff]' : valid ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-sm">
                      <span className="font-bold">e = {String(e)}</span>
                      <span className={`ml-3 px-2 py-0.5 text-[10px] rounded font-bold uppercase ${valid ? 'bg-green-600 text-white' : 'bg-red-100 text-red-700'}`}>
                        {trace === null
                          ? `e ≥ φ — не годится`
                          : `gcd = ${String(trace.gcd)} ${valid ? '✓' : '✗'}`
                        }
                      </span>
                    </div>
                    <button
                      onClick={() => pickE(e)}
                      disabled={!valid}
                      className="px-3 py-1 text-xs font-bold bg-[#003d9b] text-white rounded disabled:bg-gray-300"
                    >Выбрать</button>
                  </div>
                  {trace !== null && <EuclidTable rows={trace.rows} showQuotient />}
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 4 && state.e && state.d && eForwardTrace && eExtTrace && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Секретная экспонента d = e⁻¹ mod φ</h3>
            <p className="text-sm text-gray-600">
              Используем расширенный алгоритм Евклида: решаем e·x + φ·y = 1, тогда d ≡ x (mod φ).
            </p>
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Прямой ход — деления</h4>
              <EuclidTable rows={eForwardTrace.rows} />
              <p className="text-[11px] text-gray-400 mt-1">Каждая строка: dividend = quotient · divisor + remainder.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Обратная подстановка</h4>
              <BackSubList steps={eExtTrace.backSub} />
            </div>
            <MathCard
              tone="green"
              title="Результат"
              expression={`x = ${eExtTrace.x}, d ≡ x (mod φ)`}
              value={`d = ${state.d}`}
              note={`Проверка: e · d mod φ = ${state.e} · ${state.d} mod ${state.phi} = ${(state.e * state.d) % state.phi}.`}
            />
          </div>
        )}

        {section === 5 && ready && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Сводка по ключам</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MathCard tone="blue" title="Публичный ключ" expression={`(e, n) = (${state.e}, ${state.n})`} note="Можно давать кому угодно." />
              <MathCard tone="green" title="Приватный ключ" expression={`(d, n) = (${state.d}, ${state.n})`} note="Храните в секрете вместе с p, q и φ(n)." />
            </div>
            <button onClick={nextStep} className="w-full py-3 bg-[#003d9b] text-white font-bold rounded-lg hover:bg-[#0052cc]">
              К шифрованию →
            </button>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <button disabled={section === 0} onClick={() => setSection(s => s - 1)}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30">‹ Назад</button>
          <button
            disabled={section >= SECTIONS.length - 1 || (section === 3 && !state.e)}
            onClick={() => setSection(s => s + 1)}
            className="px-4 py-2 text-sm font-bold text-[#003d9b] hover:bg-blue-50 rounded disabled:opacity-30">Далее ›</button>
        </div>
      </div>
    </motion.div>
  );
}
