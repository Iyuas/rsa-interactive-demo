import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PresetPicker from './components/PresetPicker';
import PrimeCheckViz from './components/PrimeCheckViz';
import EuclidTable from './components/EuclidTable';
import GcdSteps from './components/GcdSteps';
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
    // Stay on section 0 so the user can watch the trial-division animation run;
    // they advance manually with the "Далее" pill or bottom button.
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
          Шаг 1 из 3. Из двух простых чисел p и q соберём оба ключа: публичный (e, n) — для шифрования, и приватный (d, n) — для расшифрования.
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
              Стойкость RSA держится на простой асимметрии: перемножить два больших простых числа легко, а разложить произведение обратно на множители — практически невозможно.
            </p>
            <PresetPicker presetId={state.presetId} onApply={applyPrimes} />
            {state.p !== null && state.q !== null && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {bigPrimes ? (
                  <>
                    <MathCard tone="green" title="p — большое простое"
                      expression={`p = ${state.p}`}
                      note="Простота проверена заранее: перебор делителей до √p занял бы тысячи шагов и заморозил бы анимацию." />
                    <MathCard tone="green" title="q — большое простое"
                      expression={`q = ${state.q}`}
                      note="Около 2³¹ ≈ 2,1 миллиарда. RSA работает и на таких числах, хотя в реальности используют гораздо большие." />
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
            <p className="text-sm text-gray-600">
              n войдёт в публичный ключ — его увидит каждый. Зная только n, восстановить p и q практически невозможно: на этом и держится секретность.
            </p>
            <MathCard
              title="Подстановка"
              expression={`n = ${state.p} · ${state.q}`}
              value={String(state.n)}
              note="Все дальнейшие операции — шифрование и расшифрование — будут идти по модулю n."
            />
          </div>
        )}

        {section === 2 && state.phi !== null && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Функция Эйлера φ(n) = (p−1)(q−1)</h3>
            <p className="text-sm text-gray-600">
              φ(n) — это количество чисел от 1 до n−1, у которых нет общих делителей с n. Для произведения двух простых формула короткая: (p−1)(q−1). Без знания p и q это значение посчитать не получится — поэтому φ(n) хранится в секрете и нужно нам только для подбора d.
            </p>
            <MathCard
              title="Подстановка"
              expression={`φ(n) = (${state.p} − 1) · (${state.q} − 1) = ${state.p - 1n} · ${state.q - 1n}`}
              value={String(state.phi)}
            />
          </div>
        )}

        {section === 3 && eCandidates.length > 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Выбор открытой экспоненты e</h3>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                e — это степень, в которую возводим сообщение при шифровании: <span className="font-mono">C = M<sup>e</sup> mod n</span>. Чтобы алгоритм работал, кандидат должен одновременно удовлетворять трём условиям:
              </p>
              <ol className="list-decimal pl-6 space-y-1.5 marker:font-bold marker:text-[#003d9b]">
                <li>
                  <span className="font-bold text-[#041b3c]">e — простое число.</span> Так проще: для простого e совместимость с φ(n) сводится к одному вопросу — делит ли e число φ(n). Поэтому кандидаты ниже — стандартные простые: 3, 5, 7, …, 65537.
                </li>
                <li>
                  <span className="font-bold text-[#041b3c]">e &lt; φ(n).</span> Иначе e всё равно «свернётся» по модулю φ к меньшему числу — каноническое значение e лежит в диапазоне 1…φ(n)−1.
                </li>
                <li>
                  <span className="font-bold text-[#041b3c]">gcd(e, φ(n)) = 1.</span> e и φ(n) должны быть взаимно простыми. Без этого не существует d — обратного к e по модулю φ — и расшифрование становится невозможным.
                </li>
              </ol>
              <p>
                Условие 1 уже выполнено для всех кандидатов (это простые). Условие 2 проверяется напрямую: e &lt; φ(n) = {String(state.phi)}. Условие 3 — алгоритмом Евклида: если gcd(φ, e) = 1, кандидат подходит.
              </p>
            </div>
            <div className="space-y-4">
              {eCandidates.map(({ e, valid, trace }) => {
                const failsBound = trace === null;
                const failsGcd = trace !== null && trace.gcd !== 1n;
                const badgeText = failsBound
                  ? `условие 2: e ≥ φ ✗`
                  : failsGcd
                    ? `условие 3: gcd = ${String(trace.gcd)} ✗`
                    : `все условия ✓ (gcd = 1)`;
                return (
                  <div key={String(e)} className={`border rounded-lg p-4 ${state.e === e ? 'border-[#003d9b] bg-[#f1f3ff]' : valid ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-mono text-sm">
                        <span className="font-bold">e = {String(e)}</span>
                        <span className={`ml-3 px-2 py-0.5 text-[10px] rounded font-bold uppercase ${valid ? 'bg-green-600 text-white' : 'bg-red-100 text-red-700'}`}>
                          {badgeText}
                        </span>
                      </div>
                      <button
                        onClick={() => pickE(e)}
                        disabled={!valid}
                        className="px-3 py-1 text-xs font-bold bg-[#003d9b] text-white rounded disabled:bg-gray-300"
                      >Выбрать</button>
                    </div>
                    {trace !== null && <GcdSteps rows={trace.rows} showRule={false} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {section === 4 && state.e && state.d && eForwardTrace && eExtTrace && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Секретная экспонента d = e⁻¹ mod φ</h3>
            <p className="text-sm text-gray-600">
              d — это число, которое «отменяет» возведение в степень e: должно выполняться e · d ≡ 1 (mod φ(n)). Иначе говоря, d — обратный элемент к e по модулю φ(n). Найти его можно расширенным алгоритмом Евклида: он решает уравнение e·x + φ·y = 1, и тогда d = x mod φ.
            </p>
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Прямой ход — деления с остатком</h4>
              <EuclidTable rows={eForwardTrace.rows} />
              <p className="text-[11px] text-gray-400 mt-1">Каждая строка: делимое = частное · делитель + остаток. Идём вниз, пока остаток не станет 0; предыдущий остаток — это gcd.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Обратная подстановка</h4>
              <p className="text-[11px] text-gray-400 mb-2">Выражаем gcd через предыдущие строки и идём снизу вверх, пока не получим x и y, для которых e·x + φ·y = 1.</p>
              <BackSubList steps={eExtTrace.backSub} />
            </div>
            <MathCard
              tone="green"
              title="Результат"
              expression={`x = ${eExtTrace.x}, d ≡ x (mod φ)`}
              value={`d = ${state.d}`}
              note={`Проверка: e · d mod φ = ${state.e} · ${state.d} mod ${state.phi} = ${(state.e * state.d) % state.phi}. Получили 1 — значит d действительно обратное к e.`}
            />
          </div>
        )}

        {section === 5 && ready && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Сводка по ключам</h3>
            <p className="text-sm text-gray-600">
              Ключи готовы. Публичный — раздаётся открыто, по нему любой может зашифровать сообщение. Приватный — никому не показывается, по нему расшифровывает только владелец.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MathCard tone="blue" title="Публичный ключ" expression={`(e, n) = (${state.e}, ${state.n})`} note="Передаём всем, кто хочет нам что-то зашифровать." />
              <MathCard tone="green" title="Приватный ключ" expression={`(d, n) = (${state.d}, ${state.n})`} note="Храним в секрете — вместе с p, q и φ(n), из которых d был получен." />
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
            disabled={
              section >= SECTIONS.length - 1 ||
              (section === 0 && !state.p) ||
              (section === 3 && !state.e)
            }
            onClick={() => setSection(s => s + 1)}
            className="px-4 py-2 text-sm font-bold text-[#003d9b] hover:bg-blue-50 rounded disabled:opacity-30">Далее ›</button>
        </div>
      </div>
    </motion.div>
  );
}
