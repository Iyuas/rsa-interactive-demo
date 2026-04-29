import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AsciiTableViz from './components/AsciiTableViz';
import ModPowViz from './components/ModPowViz';
import { encodeBlocks } from './utils/ascii';
import { modPowTrace } from './utils/rsaMath';

const DEFAULT_TEXT = 'HI';

export default function Encryption({ state, setState, nextStep, prevStep }) {
  const [text, setText] = useState(state.plaintext || DEFAULT_TEXT);
  const [phase, setPhase] = useState(0); // 0 input, 1 digitize, 2 encrypt, 3 done
  const [activeBlock, setActiveBlock] = useState(0);
  const [err, setErr] = useState(null);

  const digitize = () => {
    try {
      const blocks = encodeBlocks(text, state.n);
      setState(s => ({ ...s, plaintext: text, blocks: blocks.map(b => ({ ...b, cipher: null })) }));
      setPhase(1);
      setErr(null);
    } catch (e) { setErr(e.message); }
  };

  const encryptBlock = (i) => {
    const b = state.blocks[i];
    const trace = modPowTrace(b.value, state.e, state.n);
    setState(s => ({
      ...s,
      blocks: s.blocks.map((bl, j) => j === i ? { ...bl, cipher: trace.result } : bl),
    }));
  };

  const allTraces = useMemo(() => {
    if (phase < 2 || !state.blocks.length) return [];
    return state.blocks.map(b => modPowTrace(b.value, state.e, state.n));
  }, [phase, state.blocks, state.e, state.n]);

  const allDone = state.blocks.length > 0 && state.blocks.every(b => b.cipher !== null);

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#041b3c]">Шифрование</h1>
          <p className="text-gray-600 mt-1">Шаг 2 из 3. Превращаем текст в число M, потом считаем шифртекст по формуле C = M<sup>e</sup> mod n.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2">
          <span className="text-[10px] font-bold text-[#003d9b] uppercase">Публичный ключ</span>
          <div className="font-mono text-sm text-blue-900 font-bold">e={String(state.e)}, n={String(state.n)}</div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-1">Ввод сообщения</h3>
          <p className="text-sm text-gray-600 mb-3">
            Введите текст. На следующем шаге каждая буква превратится в свой ASCII-код, а коды соберутся в числа M, которые поместятся в модуль n.
          </p>
          <div className="flex gap-3">
            <input value={text} onChange={e => setText(e.target.value)}
              placeholder="ASCII-текст"
              className="flex-1 border border-[#c3c6d6] rounded-lg p-3 font-mono text-lg" />
            <button onClick={digitize} disabled={!text}
              className="bg-[#003d9b] text-white px-6 rounded-lg font-bold disabled:bg-gray-300">
              Оцифровать
            </button>
          </div>
          {err && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              <p className="font-bold mb-1">Не получилось оцифровать</p>
              <p className="text-xs mb-2">{err}</p>
              {state.n !== null && state.n < 128n && (
                <button onClick={prevStep} className="text-xs font-bold text-[#003d9b] hover:underline">
                  ‹ Вернуться к выбору простых
                </button>
              )}
            </div>
          )}
        </div>

        {phase >= 1 && state.blocks.length > 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Перевод в числа</h3>
            <p className="text-sm text-gray-600">
              Берём ASCII-код каждой буквы (3 цифры на символ) и склеиваем в одно число. Если оно вдруг окажется ≥ n, бьём текст на блоки поменьше — RSA умеет работать только с числами строго меньше n.
            </p>
            <AsciiTableViz text={text} codes={[...text].map(c => c.charCodeAt(0))} />
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Блоки (каждый блок &lt; n)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {state.blocks.map((b, i) => (
                  <div key={i} className={`border rounded-lg p-3 ${i === activeBlock ? 'border-[#003d9b] bg-[#f1f3ff]' : 'border-[#c3c6d6] bg-white'}`}>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Блок {i + 1}</div>
                    <div className="font-mono text-xs text-gray-400">{b.chars.join('')} → {b.digitStr}</div>
                    <div className="font-mono text-lg font-bold text-[#003d9b]">M = {String(b.value)}</div>
                    {b.cipher !== null && <div className="font-mono text-sm font-bold text-green-700 mt-1">C = {String(b.cipher)}</div>}
                  </div>
                ))}
              </div>
            </div>
            {phase === 1 && (
              <button onClick={() => setPhase(2)} className="w-full py-3 bg-[#003d9b] text-white font-bold rounded-lg hover:bg-[#0052cc]">
                Перейти к возведению в степень →
              </button>
            )}
          </div>
        )}

        {phase >= 2 && allTraces.length > 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Возведение в степень</h3>
              <div className="flex gap-1 flex-wrap">
                {state.blocks.map((_, i) => (
                  <button key={i} onClick={() => setActiveBlock(i)}
                    className={`px-3 py-1 text-xs font-bold rounded ${i === activeBlock ? 'bg-[#003d9b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Блок {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Возводить M в степень e напрямую невозможно: даже для маленьких чисел результат вырастает до сотен цифр. Идея алгоритма «возведение в квадрат и умножение»: записываем e в двоичной системе и читаем разряды слева направо. На каждом — возводим текущий результат r в квадрат (так показатель удваивается). Если разряд равен 1 — дополнительно умножаем на M. После каждой операции берём mod n, чтобы число не разрасталось.
            </p>

            <ModPowViz
              base={state.blocks[activeBlock].value}
              exp={state.e}
              mod={state.n}
              trace={allTraces[activeBlock]}
              label={`C${activeBlock + 1} = M${activeBlock + 1}^e mod n`}
            />

            {state.blocks[activeBlock].cipher === null && (
              <button
                onClick={() => encryptBlock(activeBlock)}
                className="w-full py-2 bg-[#003d9b] text-white font-bold rounded text-sm"
              >Сохранить C для блока {activeBlock + 1}</button>
            )}
          </div>
        )}

        {allDone && (
          <div className="bg-gradient-to-br from-white to-[#e0e8ff] border-2 border-[#003d9b] rounded-xl p-6">
            <h3 className="text-xl font-bold text-[#041b3c] mb-2">Сообщение зашифровано</h3>
            <p className="text-sm text-gray-600 mb-3">
              Это и есть шифртекст: набор чисел, которые без знания d превратить обратно в текст не получится.
            </p>
            <div className="font-mono text-sm space-y-1 text-[#003d9b]">
              {state.blocks.map((b, i) => (
                <div key={i}>C{i + 1} = {String(b.cipher)}</div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={prevStep} className="text-gray-500 font-bold">‹ Назад</button>
              <button onClick={nextStep} className="bg-[#003d9b] text-white font-bold px-6 py-2 rounded">
                К расшифрованию →
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
