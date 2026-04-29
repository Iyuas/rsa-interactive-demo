import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AsciiTableViz from './components/AsciiTableViz';
import ModPowViz from './components/ModPowViz';
import { encodeBlocks } from './utils/ascii';
import { modPowTrace } from './utils/rsaMath';

const DEFAULT_TEXT = 'HI';

// Card style that reads from CSS vars injected by Layout
const card = {
  background: 'var(--t-surface)',
  border: '1px solid var(--t-border)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

export default function Encryption({ state, setState, nextStep, prevStep }) {
  const [text, setText] = useState(state.plaintext || DEFAULT_TEXT);
  const [phase, setPhase] = useState(0); // 0 input, 1 digitize, 2 encrypt+done
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

  // Compute all traces when we have blocks
  const allTraces = useMemo(() => {
    if (!state.blocks.length) return [];
    return state.blocks.map(b => modPowTrace(b.value, state.e, state.n));
  }, [state.blocks, state.e, state.n]);

  // AUTO-ENCRYPT: as soon as phase becomes 2, encrypt all blocks at once
  useEffect(() => {
    if (phase === 2 && state.blocks.length > 0 && allTraces.length === state.blocks.length) {
      setState(s => ({
        ...s,
        blocks: s.blocks.map((bl, i) =>
          bl.cipher === null ? { ...bl, cipher: allTraces[i].result } : bl
        ),
      }));
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const allDone = state.blocks.length > 0 && state.blocks.every(b => b.cipher !== null);

  const primary = 'var(--t-primary)';
  const textColor = 'var(--t-text)';
  const muted = 'var(--t-text-muted)';
  const border = 'var(--t-border)';
  const primaryBg = 'var(--t-primary-bg)';
  const surfaceAlt = 'var(--t-surface-alt)';

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, margin: 0 }}>Шифрование</h1>
          <p style={{ color: muted, marginTop: '0.25rem', margin: '0.25rem 0 0' }}>
            Шаг 2 из 3. C = M<sup>e</sup> mod n — вычисляем честно.
          </p>
        </div>
        <div style={{ background: primaryBg, border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: primary, textTransform: 'uppercase' }}>Публичный ключ</span>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: textColor, fontWeight: 700 }}>e={String(state.e)}, n={String(state.n)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Input */}
        <div style={card}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '0.75rem', color: textColor }}>Ввод сообщения</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="ASCII-текст"
              style={{ flex: 1, border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '0.75rem', fontFamily: 'monospace', fontSize: '1.125rem', background: 'var(--t-bg)', color: textColor, outline: 'none' }}
            />
            <button
              onClick={digitize}
              disabled={!text}
              style={{ background: text ? primary : '#9ca3af', color: '#fff', padding: '0 1.5rem', borderRadius: '0.5rem', fontWeight: 700, border: 'none', cursor: text ? 'pointer' : 'not-allowed', fontSize: '0.875rem' }}
            >
              Оцифровать
            </button>
          </div>
          {err && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontFamily: 'monospace' }}>{err}</p>}
        </div>

        {/* Digitized blocks */}
        {phase >= 1 && state.blocks.length > 0 && (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Перевод в числа</h3>
            <AsciiTableViz text={text} codes={[...text].map(c => c.charCodeAt(0))} />
            <div>
              <h4 style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: muted, marginBottom: '0.5rem' }}>
                Блоки (каждый блок &lt; n)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {state.blocks.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${i === activeBlock ? primary : border}`,
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      background: i === activeBlock ? primaryBg : surfaceAlt,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => { setActiveBlock(i); if (phase === 1) setPhase(2); }}
                  >
                    <div style={{ fontSize: '0.625rem', color: muted, textTransform: 'uppercase', fontWeight: 700 }}>Блок {i + 1}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: muted }}>{b.chars.join('')} → {b.digitStr}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 700, color: primary }}>M = {String(b.value)}</div>
                    {b.cipher !== null && (
                      <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700, color: 'var(--t-accent)', marginTop: '0.25rem' }}>
                        C = {String(b.cipher)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {phase === 1 && (
              <button
                onClick={() => setPhase(2)}
                style={{ width: '100%', padding: '0.75rem', background: primary, color: '#fff', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Перейти к возведению в степень →
              </button>
            )}
          </div>
        )}

        {/* ModPow visualization — shown per block, read-only, all already encrypted */}
        {phase >= 2 && allTraces.length > 0 && (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>
                Возведение в степень
                <span style={{ marginLeft: '0.75rem', fontSize: '0.7rem', fontWeight: 600, background: '#22c55e22', color: '#16a34a', padding: '0.1rem 0.5rem', borderRadius: '999px', verticalAlign: 'middle' }}>
                  ✓ Все блоки зашифрованы автоматически
                </span>
              </h3>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {state.blocks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBlock(i)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      background: i === activeBlock ? primary : 'var(--t-surface-alt)',
                      color: i === activeBlock ? '#fff' : muted,
                    }}
                  >
                    Блок {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: muted, margin: 0 }}>
              Метод «квадрат и умножение»: двоичное представление e даёт программу действий.
              Квадрат на каждом бите, умножение на base на каждом 1-бите.
            </p>

            <ModPowViz
              key={activeBlock}
              base={state.blocks[activeBlock].value}
              exp={state.e}
              mod={state.n}
              trace={allTraces[activeBlock]}
              label={`C${activeBlock + 1} = M${activeBlock + 1}^e mod n`}
            />

            {/* Result display — no save button needed */}
            {state.blocks[activeBlock].cipher !== null && (
              <div style={{ background: primaryBg, border: `1px solid ${primary}`, borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--t-accent)', fontSize: '1.25rem' }}>check_circle</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: textColor }}>
                  C{activeBlock + 1} = {String(state.blocks[activeBlock].cipher)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Done summary */}
        {allDone && (
          <div style={{ background: `linear-gradient(135deg, var(--t-surface), var(--t-primary-bg))`, border: `2px solid ${primary}`, borderRadius: '0.75rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: textColor, marginTop: 0, marginBottom: '0.5rem' }}>Сообщение зашифровано</h3>
            <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: primary }}>
              {state.blocks.map((b, i) => (
                <div key={i}>C{i + 1} = {String(b.cipher)}</div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button onClick={prevStep} style={{ color: muted, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>‹ Назад</button>
              <button
                onClick={nextStep}
                style={{ background: primary, color: '#fff', fontWeight: 700, padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                К расшифрованию →
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
