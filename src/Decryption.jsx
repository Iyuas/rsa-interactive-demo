import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ModPowViz from './components/ModPowViz';
import AsciiTableViz from './components/AsciiTableViz';
import MathCard from './components/MathCard';
import { modPowTrace } from './utils/rsaMath';
import { decodeBlocks, decodeValue } from './utils/ascii';

const card = {
  background: 'var(--t-surface)',
  border: '1px solid var(--t-border)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

export default function Decryption({ state, prevStep }) {
  const [phase, setPhase] = useState(0);
  const [activeBlock, setActiveBlock] = useState(0);
  const [decrypted, setDecrypted] = useState(Array(state.blocks.length).fill(null));

  const ready = state.blocks.length > 0 && state.blocks.every(b => b.cipher !== null);

  const traces = useMemo(
    () => ready ? state.blocks.map(b => modPowTrace(b.cipher, state.d, state.n)) : [],
    [ready, state.blocks, state.d, state.n],
  );

  // AUTO-DECRYPT all blocks when phase becomes 1
  useEffect(() => {
    if (phase === 1 && traces.length > 0) {
      setDecrypted(traces.map(t => t.result));
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const allDone = decrypted.length > 0 && decrypted.every(v => v !== null);

  const plaintext = useMemo(() => {
    if (!allDone) return '';
    const rebuilt = state.blocks.map((b, i) => ({ ...b, value: decrypted[i] }));
    return decodeBlocks(rebuilt);
  }, [allDone, state.blocks, decrypted]);

  const primary = 'var(--t-primary)';
  const textColor = 'var(--t-text)';
  const muted = 'var(--t-text-muted)';
  const border = 'var(--t-border)';
  const primaryBg = 'var(--t-primary-bg)';
  const accent = 'var(--t-accent)';
  const surfaceAlt = 'var(--t-surface-alt)';

  if (!ready) {
    return (
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, marginBottom: '1rem' }}>Расшифрование</h1>
        <div style={card}>
          <p style={{ color: muted }}>Сначала нужно сгенерировать ключи и зашифровать сообщение.</p>
          <button onClick={prevStep} style={{ marginTop: '1rem', color: primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>‹ Назад к шифрованию</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, margin: 0 }}>Расшифрование</h1>
          <p style={{ color: muted, margin: '0.25rem 0 0' }}>Шаг 3 из 3. M = C<sup>d</sup> mod n.</p>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Приватный ключ</span>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#14532d', fontWeight: 700 }}>d={String(state.d)}, n={String(state.n)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {phase === 0 && (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Почему работает</h3>
            <MathCard
              tone="gray"
              title="Теорема Эйлера"
              expression={`M^(e·d) ≡ M^(1 + k·φ(n)) ≡ M · (M^φ(n))^k ≡ M (mod n)`}
              note={`Поскольку e·d ≡ 1 (mod φ), применение степени d к C = M^e возвращает исходное M.`}
            />
            <div>
              <h4 style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: muted, marginBottom: '0.5rem' }}>Ciphertext-блоки</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {state.blocks.map((b, i) => (
                  <div key={i} style={{ border: `1px solid ${border}`, borderRadius: '0.375rem', padding: '0.75rem', background: surfaceAlt }}>
                    <div style={{ fontSize: '0.625rem', color: muted, textTransform: 'uppercase', fontWeight: 700 }}>C{i + 1}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 700, color: primary }}>{String(b.cipher)}</div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setPhase(1)}
              style={{ width: '100%', padding: '0.75rem', background: primary, color: '#fff', fontWeight: 700, borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              Расшифровать блоки →
            </button>
          </div>
        )}

        {phase >= 1 && (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>
                Возведение в степень (d)
                <span style={{ marginLeft: '0.75rem', fontSize: '0.7rem', fontWeight: 600, background: '#22c55e22', color: '#16a34a', padding: '0.1rem 0.5rem', borderRadius: '999px', verticalAlign: 'middle' }}>
                  ✓ Все блоки расшифрованы автоматически
                </span>
              </h3>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {state.blocks.map((_, i) => (
                  <button key={i} onClick={() => setActiveBlock(i)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      background: i === activeBlock ? '#16a34a' : surfaceAlt,
                      color: i === activeBlock ? '#fff' : muted,
                    }}>
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

            {decrypted[activeBlock] !== null && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '1.25rem' }}>check_circle</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#14532d' }}>
                  M{activeBlock + 1} = {String(decrypted[activeBlock])}
                </span>
              </div>
            )}
          </div>
        )}

        {allDone && (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Декодирование блоков в ASCII</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {state.blocks.map((b, i) => (
                <MathCard key={i} tone="green" title={`Блок ${i + 1}`}
                  expression={`M = ${decrypted[i]}`}
                  value={decodeValue(decrypted[i], b.chars.length)}
                  note="Делим число на 3-значные группы (каждая — ASCII-код)." />
              ))}
            </div>
            <AsciiTableViz text={plaintext} codes={[...plaintext].map(c => c.charCodeAt(0))} />
          </div>
        )}

        {allDone && (
          <div style={{ background: `linear-gradient(135deg, var(--t-surface), var(--t-primary-bg))`, border: `2px solid ${primary}`, borderRadius: '0.75rem', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, marginTop: 0, marginBottom: '0.5rem' }}>Сообщение восстановлено</h2>
            <p style={{ fontSize: '0.875rem', color: muted, marginBottom: '1rem' }}>Никаких подстав: текст ниже — результат настоящего modPow.</p>
            <div style={{ background: primary, color: '#fff', display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 900, fontSize: '1.5rem', fontFamily: 'monospace' }}>
              {plaintext}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
              <button onClick={prevStep} style={{ color: muted, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>‹ Назад к шифрованию</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
