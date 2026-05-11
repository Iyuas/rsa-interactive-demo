import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AsciiTableViz from './components/AsciiTableViz';
import MathCard from './components/MathCard';
import AnswerCheck from './components/AnswerCheck';
import Calculator from './components/Calculator';
import { modPowTrace } from './utils/rsaMath';
import { decodeValue } from './utils/ascii';

const card = {
  background: 'var(--t-surface)',
  border: '1px solid var(--t-border)',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

const normalizeNumber = (value) => value.replace(/\s+/g, '').trim();

export default function Decryption({ state, prevStep }) {
  const [activeBlock, setActiveBlock] = useState(0);
  const [decrypted, setDecrypted] = useState(Array(state.blocks.length).fill(null));

  const ready = state.blocks.length > 0 && state.blocks.every((b) => b.cipher !== null);
  const traces = useMemo(
    () => ready ? state.blocks.map((b) => modPowTrace(b.cipher, state.d, state.n)) : [],
    [ready, state.blocks, state.d, state.n],
  );
  const allDone = decrypted.length > 0 && decrypted.every((v) => v !== null);
  const plaintext = allDone ? decrypted.map((v) => decodeValue(v)).join('') : '';

  const savePlainNumber = (index) => {
    setDecrypted((items) => items.map((value, i) => i === index ? traces[index].result : value));
  };

  const primary = 'var(--t-primary)';
  const textColor = 'var(--t-text)';
  const muted = 'var(--t-text-muted)';
  const border = 'var(--t-border)';
  const surfaceAlt = 'var(--t-surface-alt)';

  if (!ready) {
    return (
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, marginBottom: '1rem' }}>Decryption</h1>
        <div style={card}>
          <p style={{ color: muted }}>Generate keys and encrypt a message first.</p>
          <button onClick={prevStep} style={{ marginTop: '1rem', color: primary, fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Back to encryption</button>
        </div>
      </motion.div>
    );
  }

  const active = state.blocks[activeBlock];
  const activeTrace = traces[activeBlock];

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, margin: 0 }}>Decryption</h1>
          <p style={{ color: muted, margin: '0.25rem 0 0' }}>Step 3 of 3. Recover each character with M = C^d mod n.</p>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Private key</span>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#14532d', fontWeight: 800 }}>d={String(state.d)}, n={String(state.n)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 18rem', gap: '1rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Ciphertext numbers</h3>
            <p style={{ color: muted, margin: 0, fontSize: '0.875rem' }}>
              Each ciphertext number came from one character. Select one, decrypt it, then convert the recovered ASCII code back to a letter.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {state.blocks.map((b, i) => (
                <button key={i} onClick={() => setActiveBlock(i)}
                  style={{
                    border: `1px solid ${i === activeBlock ? primary : border}`,
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    background: i === activeBlock ? 'var(--t-primary-bg)' : surfaceAlt,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}>
                  <div style={{ fontSize: '0.625rem', color: muted, textTransform: 'uppercase', fontWeight: 800 }}>Character {i + 1}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: primary, fontWeight: 800 }}>C = {String(b.cipher)}</div>
                  {decrypted[i] !== null && <div style={{ fontFamily: 'monospace', color: '#15803d', fontWeight: 800 }}>M = {String(decrypted[i])}</div>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Decrypt the selected ciphertext</h3>
            <MathCard tone="green" title="Your task" expression={`M = ${active.cipher}^${state.d} mod ${state.n}`} note="The result should be the ASCII number of the original character." />
            <AnswerCheck
              key={`decrypt-${activeBlock}-${active.cipher}`}
              label={`Plain number for character ${activeBlock + 1}`}
              hint={`Find M for C = ${active.cipher}.`}
              expected={activeTrace.result}
              normalize={normalizeNumber}
              formatSolution={() => `${active.cipher}^${state.d} mod ${state.n} = ${activeTrace.result}`}
              onCorrect={() => savePlainNumber(activeBlock)}
            />
          </div>

          {allDone && (
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>ASCII back to text</h3>
              <AsciiTableViz text={plaintext} codes={decrypted.map((v) => Number(v))} />
              <div style={{ background: 'var(--t-primary-bg)', border: `2px solid ${primary}`, borderRadius: '0.5rem', padding: '1.25rem' }}>
                <div style={{ color: muted, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recovered message</div>
                <div style={{ background: primary, color: '#fff', display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 900, fontSize: '1.5rem', fontFamily: 'monospace' }}>
                  {plaintext}
                </div>
              </div>
              <button onClick={prevStep} style={{ alignSelf: 'flex-start', color: muted, fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Back to encryption</button>
            </div>
          )}
        </div>
        <Calculator />
      </div>
    </motion.div>
  );
}
