import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ModPowViz from './components/ModPowViz';
import AsciiTableViz from './components/AsciiTableViz';
import MathCard from './components/MathCard';
import { modPowTrace } from './utils/rsaMath';
import { decodeBlocks, decodeValue } from './utils/ascii';

export default function Decryption({ state, prevStep }) {
  const [phase, setPhase] = useState(0);   // 0 intro, 1 decrypt, 2 decode-done
  const [activeBlock, setActiveBlock] = useState(0);
  const [decrypted, setDecrypted] = useState(
    Array(state.blocks.length).fill(null)
  );

  // Only compute traces once every block has a cipher — prevents crashes when
  // the user jumps directly to step 3 via the sidebar before finishing encryption.
  const ready = state.blocks.length > 0 && state.blocks.every(b => b.cipher !== null);

  const traces = useMemo(
    () => ready ? state.blocks.map(b => modPowTrace(b.cipher, state.d, state.n)) : [],
    [ready, state.blocks, state.d, state.n],
  );

  const commitBlock = (i) => {
    setDecrypted(prev => prev.map((v, j) => j === i ? traces[i].result : v));
  };

  const allDone = decrypted.length > 0 && decrypted.every(v => v !== null);

  const plaintext = useMemo(() => {
    if (!allDone) return '';
    const rebuilt = state.blocks.map((b, i) => ({
      ...b,
      value: decrypted[i],
    }));
    return decodeBlocks(rebuilt);
  }, [allDone, state.blocks, decrypted]);

  if (!ready) {
    return (
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
        <h1 className="text-3xl font-bold text-[#041b3c] mb-4">Расшифрование</h1>
        <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm">
          <p className="text-gray-600">
            Сначала нужно сгенерировать ключи и зашифровать сообщение. Вернитесь к предыдущим шагам.
          </p>
          <button onClick={prevStep} className="mt-4 text-[#003d9b] font-bold">‹ Назад к шифрованию</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#041b3c]">Расшифрование</h1>
          <p className="text-gray-600 mt-1">Шаг 3 из 3. M = C<sup>d</sup> mod n.</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded px-4 py-2">
          <span className="text-[10px] font-bold text-green-700 uppercase">Приватный ключ</span>
          <div className="font-mono text-sm text-green-900 font-bold">d={String(state.d)}, n={String(state.n)}</div>
        </div>
      </div>

      <div className="space-y-6">
        {phase === 0 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Почему работает</h3>
            <MathCard
              tone="gray"
              title="Теорема Эйлера"
              expression={`M^(e·d) ≡ M^(1 + k·φ(n)) ≡ M · (M^φ(n))^k ≡ M (mod n)`}
              note={`Поскольку e·d ≡ 1 (mod φ), применение степени d к C = M^e возвращает исходное M. Никакой магии — чистая теоретико-числовая тождественность.`}
            />
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Ciphertext-блоки</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {state.blocks.map((b, i) => (
                  <div key={i} className="border border-[#c3c6d6] rounded p-3 bg-gray-50">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">C{i + 1}</div>
                    <div className="font-mono text-lg font-bold text-[#003d9b]">{String(b.cipher)}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setPhase(1)} className="w-full py-3 bg-[#003d9b] text-white font-bold rounded-lg">
              Расшифровать блоки →
            </button>
          </div>
        )}

        {phase >= 1 && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Возведение в степень (d)</h3>
              <div className="flex gap-1 flex-wrap">
                {state.blocks.map((_, i) => (
                  <button key={i} onClick={() => setActiveBlock(i)}
                    className={`px-3 py-1 text-xs font-bold rounded ${i === activeBlock ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Блок {i + 1} {decrypted[i] !== null ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>

            <ModPowViz
              base={state.blocks[activeBlock].cipher}
              exp={state.d}
              mod={state.n}
              trace={traces[activeBlock]}
              label={`M${activeBlock + 1} = C${activeBlock + 1}^d mod n`}
            />

            {decrypted[activeBlock] === null && (
              <button onClick={() => commitBlock(activeBlock)}
                className="w-full py-2 bg-green-600 text-white font-bold rounded text-sm">
                Сохранить M для блока {activeBlock + 1}
              </button>
            )}
          </div>
        )}

        {allDone && (
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">Декодирование блоков в ASCII</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {state.blocks.map((b, i) => (
                <MathCard
                  key={i}
                  tone="green"
                  title={`Блок ${i + 1}`}
                  expression={`M = ${decrypted[i]}`}
                  value={decodeValue(decrypted[i], b.chars.length)}
                  note="Делим число на 3-значные группы (каждая — ASCII-код)."
                />
              ))}
            </div>
            <AsciiTableViz text={plaintext} codes={[...plaintext].map(c => c.charCodeAt(0))} />
          </div>
        )}

        {allDone && (
          <div className="bg-gradient-to-br from-white to-[#e0e8ff] border-2 border-[#003d9b] rounded-xl p-8 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-[#041b3c] mb-2">Сообщение восстановлено</h2>
            <p className="text-sm text-gray-600 mb-4">Никаких подстав: текст ниже — результат настоящего modPow.</p>
            <div className="bg-[#003d9b] text-white inline-block px-6 py-3 rounded-lg font-black text-2xl font-mono">
              {plaintext}
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={prevStep} className="text-gray-500 font-bold">‹ Назад к шифрованию</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
