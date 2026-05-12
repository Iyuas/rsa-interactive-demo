import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AsciiTableViz from './components/AsciiTableViz';
import MathCard from './components/MathCard';
import AnswerCheck from './components/AnswerCheck';
import Calculator from './components/Calculator';
import Concept from './components/Concept';
import Glossary from './components/Glossary';
import ProgressRail from './components/ProgressRail';
import Coach from './components/Coach';
import EulerOrbit from './components/lab/EulerOrbit';
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

const navBtn = (disabled) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.2rem',
  padding: '0.35rem 0.7rem',
  fontSize: '0.7rem',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderRadius: '0.4rem',
  border: '1px solid var(--t-border)',
  background: 'var(--t-surface-alt)',
  color: disabled ? 'var(--t-text-muted)' : 'var(--t-primary)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
});

export default function Decryption({ state, setState, prevStep }) {
  const [activeBlock, setActiveBlock] = useState(0);
  const [decrypted, setDecrypted] = useState(Array(state.blocks.length).fill(null));

  const markConcept = (name) => {
    if (!setState) return;
    setState((s) => ({ ...s, concepts: { ...s.concepts, [name]: true } }));
  };
  const concepts = state.concepts || {};

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
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, margin: 0 }}>Decryption</h1>
          <p style={{ color: muted, margin: '0.25rem 0 0' }}>Step 3 of 3. Recover each character with M = C<sup>d</sup> mod n. Only the <Glossary term="privatekey">private key</Glossary> can do this.</p>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Private key</span>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#14532d', fontWeight: 800 }}>d={String(state.d)}, n={String(state.n)}</div>
        </div>
      </div>

      <ProgressRail items={[
        { label: 'd', value: state.d ? String(state.d) : null, done: !!state.d },
        { label: 'n', value: state.n ? String(state.n) : null, done: !!state.n },
        { label: 'ciphertexts', value: state.blocks.length || null, done: state.blocks.length > 0 },
        { label: 'decrypted', value: decrypted.filter(v => v !== null).length, done: decrypted.length > 0 && decrypted.every(v => v !== null) },
      ]} />
      <div style={{ height: '1rem' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 18rem', gap: '1rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <Concept
            title="Why does raising to the d-th power return M?"
            question={<>Raising C to the power d looks like just another modular exponentiation. The magic is that after exactly e·d multiplications by M, the orbit returns to M. Try a small example below, run the orbit, and watch it close.</>}
            discoverDone={concepts.eulerian}
            discover={
              <EulerOrbit
                n={state.n}
                e={state.e}
                d={state.d}
                onUnderstood={() => markConcept('eulerian')}
              />
            }
            reveal={
              <MathCard
                title="Euler's theorem (the engine of RSA)"
                expression="If gcd(M, n) = 1, then M^φ(n) ≡ 1 (mod n)"
                note="We chose e and d so that e·d = 1 + k·φ(n). Therefore M^(e·d) = M^1 · M^(k·φ(n)) = M · (M^φ(n))^k ≡ M · 1^k = M (mod n). C^d gives back M, exactly."
              />
            }
          />

          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Ciphertext numbers</h3>
            <p style={{ color: muted, margin: 0, fontSize: '0.875rem' }}>
              Each ciphertext number came from one character. Select one, decrypt it, then convert the recovered ASCII code back to a letter.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {state.blocks.map((b, i) => {
                const done = decrypted[i] !== null;
                const isActive = i === activeBlock;
                return (
                  <motion.button
                    key={i}
                    onClick={() => setActiveBlock(i)}
                    animate={done ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                    transition={{ duration: 0.45, times: [0, 0.4, 1], ease: 'easeOut' }}
                    style={{
                      position: 'relative',
                      border: `2px solid ${done ? 'var(--t-accent)' : isActive ? primary : border}`,
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      background: done
                        ? 'linear-gradient(135deg, #f0fdf4 0%, var(--t-surface) 100%)'
                        : isActive ? 'var(--t-primary-bg)' : surfaceAlt,
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: done
                        ? '0 0 0 3px rgba(34,197,94,0.18), 0 4px 14px rgba(34,197,94,0.18)'
                        : 'none',
                      transition: 'border-color 220ms ease, box-shadow 220ms ease, background 220ms ease',
                    }}>
                    {done && (
                      <span
                        className="material-symbols-outlined"
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          fontSize: '1rem',
                          color: 'var(--t-accent)',
                        }}
                      >
                        check_circle
                      </span>
                    )}
                    <div style={{ fontSize: '0.625rem', color: muted, textTransform: 'uppercase', fontWeight: 800 }}>Character {i + 1}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: primary, fontWeight: 800 }}>C = {String(b.cipher)}</div>
                    {done && <div style={{ fontFamily: 'monospace', color: '#15803d', fontWeight: 800 }}>M = {String(decrypted[i])}</div>}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div data-coach="decrypt-task" style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Decrypt ciphertext {activeBlock + 1} of {state.blocks.length}</h3>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => setActiveBlock(i => Math.max(0, i - 1))}
                  disabled={activeBlock === 0}
                  style={navBtn(activeBlock === 0)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_left</span>
                  Prev
                </button>
                <button
                  onClick={() => setActiveBlock(i => Math.min(state.blocks.length - 1, i + 1))}
                  disabled={activeBlock >= state.blocks.length - 1}
                  style={navBtn(activeBlock >= state.blocks.length - 1)}
                >
                  Next
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
                </button>
              </div>
            </div>
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
                <motion.div
                  initial={{ scale: 0.96 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{ background: primary, color: '#fff', display: 'inline-flex', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 900, fontSize: '1.5rem', fontFamily: 'monospace', gap: '2px' }}
                >
                  {plaintext.split('').map((ch, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: -14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.25, type: 'tween' }}
                    >
                      {ch === ' ' ? ' ' : ch}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
              <button onClick={prevStep} style={{ alignSelf: 'flex-start', color: muted, fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Back to encryption</button>
            </div>
          )}
        </div>
        <div style={{ position: 'sticky', top: '4.5rem', alignSelf: 'start' }}>
          <Calculator />
        </div>
      </div>

      <Coach
        show={!allDone && active && decrypted[activeBlock] === null}
        anchorSelector='[data-coach="decrypt-task"]'
        hintKey={`dec-task-${activeBlock}`}
        side="top"
        message={<>Compute <code>M = C^d mod n</code> for this ciphertext. The result will be the original ASCII code.</>}
      />
    </motion.div>
  );
}
