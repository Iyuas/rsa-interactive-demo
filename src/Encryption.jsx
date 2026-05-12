import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AsciiTableViz from './components/AsciiTableViz';
import AnswerCheck from './components/AnswerCheck';
import Calculator from './components/Calculator';
import MathCard from './components/MathCard';
import Concept from './components/Concept';
import Glossary from './components/Glossary';
import ProgressRail from './components/ProgressRail';
import Coach from './components/Coach';
import ModClock from './components/lab/ModClock';
import BitLadder from './components/lab/BitLadder';
import { encodeBlocks } from './utils/ascii';
import { modPowTrace } from './utils/rsaMath';

const DEFAULT_TEXT = 'HI';

const card = {
  background: 'var(--t-surface)',
  border: '1px solid var(--t-border)',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
};

const normalizeNumber = (value) => value.replace(/\s+/g, '').trim();

export default function Encryption({ state, setState, nextStep, prevStep }) {
  const [text, setText] = useState(state.plaintext || DEFAULT_TEXT);
  const [phase, setPhase] = useState(0);
  const [activeBlock, setActiveBlock] = useState(0);
  const [err, setErr] = useState(null);

  const markConcept = (name) => {
    setState((s) => ({ ...s, concepts: { ...s.concepts, [name]: true } }));
  };
  const concepts = state.concepts || {};

  const digitize = () => {
    try {
      const blocks = encodeBlocks(text, state.n);
      setState((s) => ({ ...s, plaintext: text, blocks: blocks.map((b) => ({ ...b, cipher: null })) }));
      setActiveBlock(0);
      setPhase(1);
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  const traces = useMemo(() => {
    if (!state.blocks.length) return [];
    return state.blocks.map((b) => modPowTrace(b.value, state.e, state.n));
  }, [state.blocks, state.e, state.n]);

  const saveCipher = (index) => {
    setState((s) => ({
      ...s,
      blocks: s.blocks.map((b, i) => i === index ? { ...b, cipher: traces[index].result } : b),
    }));
  };

  const allDone = state.blocks.length > 0 && state.blocks.every((b) => b.cipher !== null);
  const active = state.blocks[activeBlock];
  const activeTrace = traces[activeBlock];

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
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, margin: 0 }}>Encryption</h1>
          <p style={{ color: muted, marginTop: '0.25rem', margin: '0.25rem 0 0' }}>
            Step 2 of 3. Convert each character to a number M via <Glossary term="ascii">ASCII</Glossary>, then compute C = M<sup>e</sup> mod n. Anyone can encrypt with the <Glossary term="publickey">public key</Glossary>, but only the private key can decrypt.
          </p>
        </div>
        <div style={{ background: primaryBg, border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 800, color: primary, textTransform: 'uppercase' }}>Public key</span>
          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: textColor, fontWeight: 800 }}>e={String(state.e)}, n={String(state.n)}</div>
        </div>
      </div>

      <ProgressRail items={[
        { label: 'e', value: state.e ? String(state.e) : null, done: !!state.e },
        { label: 'n', value: state.n ? String(state.n) : null, done: !!state.n },
        { label: 'text', value: state.plaintext || null, done: !!state.plaintext },
        { label: 'chars', value: state.blocks.length || null, done: state.blocks.length > 0 },
        { label: 'encrypted chars', value: state.blocks.filter(b => b.cipher !== null).length, done: state.blocks.length > 0 && state.blocks.every(b => b.cipher !== null) },
      ]} />
      <div style={{ height: '1.25rem' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 18rem', gap: '1rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <Concept
            title="First, get a feel for mod"
            question={<>Before encrypting anything, try the <Glossary term="mod">mod</Glossary> operation. Drag the number <code>a</code>: the clock has n positions, and counting a steps from 0 lands on a mod n. Try values that wrap around the dial twice.</>}
            discoverDone={concepts.mod}
            discover={<ModClock n={7} onUnderstood={() => markConcept('mod')} />}
            reveal={
              <MathCard
                title="Rule"
                expression="a mod n = the remainder of a divided by n"
                note="Plainly: original number = full groups of n + leftover. The leftover is a mod n. In RSA n is huge, but the picture is the same — the dial is just much longer."
              />
            }
          />

          {state.e && state.n && (
            <Concept
              title="Computing huge powers modulo n"
              question={<>The number 100^1000 becomes enormous very quickly. But if all we need is the <Glossary term="mod">remainder</Glossary> there is a trick: <Glossary term="modpow">square-and-multiply</Glossary>. Step through a few binary digits and you'll see how the exponent's bits drive the algorithm.</>}
              discoverDone={concepts.modpow}
              discover={
                <BitLadder
                  base={7}
                  exponent={Number(state.e)}
                  modulus={Number(state.n) < 100000 ? Number(state.n) : 3233}
                  onUnderstood={() => markConcept('modpow')}
                />
              }
              reveal={
                <MathCard
                  title="Why it works"
                  expression="result = 1; read the exponent's bits left to right; at each bit: result = result² mod n; if the bit is 1: result = result · base mod n"
                  note="After each reduction the stored value is below n; before reduction each multiplication stays below n². The numbers never explode."
                />
              }
            />
          )}

          <div style={card}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: 0, marginBottom: '0.75rem', color: textColor }}>Message</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="ASCII text"
                style={{ flex: '1 1 16rem', border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '0.75rem', fontFamily: 'monospace', fontSize: '1.125rem', background: 'var(--t-bg)', color: textColor, outline: 'none' }}
              />
              <button
                onClick={digitize}
                disabled={!text}
                data-coach="convert-btn"
                style={{ background: text ? primary : '#9ca3af', color: '#fff', padding: '0 1.5rem', borderRadius: '0.5rem', fontWeight: 800, border: 'none', cursor: text ? 'pointer' : 'not-allowed', fontSize: '0.875rem' }}
              >
                Convert to numbers
              </button>
            </div>
            {err && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontFamily: 'monospace' }}>{err}</p>}
          </div>

          {phase >= 1 && state.blocks.length > 0 && (
            <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Characters become numbers</h3>
              <AsciiTableViz text={text} codes={[...text].map((c) => c.charCodeAt(0))} highlight={activeBlock} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                {state.blocks.map((b, i) => {
                  const done = b.cipher !== null;
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
                          : isActive ? primaryBg : surfaceAlt,
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: done
                          ? '0 0 0 3px rgba(34,197,94,0.18), 0 4px 14px rgba(34,197,94,0.18)'
                          : 'none',
                        transition: 'border-color 220ms ease, box-shadow 220ms ease, background 220ms ease',
                      }}
                    >
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
                      <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: textColor }}>
                        {b.chars[0] === ' ' ? 'space' : b.chars[0]} {'->'} M = {String(b.value)}
                      </div>
                      {done && <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--t-accent)', marginTop: '0.25rem' }}>C = {String(b.cipher)}</div>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {phase >= 1 && active && activeTrace && (
            <div data-coach="encrypt-task" style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: textColor }}>Encrypt the selected character</h3>
              <MathCard title="Your task" expression={`C = ${active.value}^${state.e} mod ${state.n}`} note="Use the calculator or your own modular arithmetic, then type the ciphertext." />
              <AnswerCheck
                key={`encrypt-${activeBlock}-${active.value}`}
                label={`Ciphertext for character ${activeBlock + 1}`}
                hint={`Find C for M = ${active.value}.`}
                expected={activeTrace.result}
                normalize={normalizeNumber}
                formatSolution={() => `${active.value}^${state.e} mod ${state.n} = ${activeTrace.result}`}
                onCorrect={() => saveCipher(activeBlock)}
              />
            </div>
          )}

          {allDone && (
            <div style={{ background: `linear-gradient(135deg, var(--t-surface), var(--t-primary-bg))`, border: `2px solid ${primary}`, borderRadius: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: textColor, marginTop: 0, marginBottom: '0.5rem' }}>Message encrypted</h3>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: primary }}>
                {state.blocks.map((b, i) => <div key={i}>{b.chars[0]}: C{i + 1} = {String(b.cipher)}</div>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button onClick={prevStep} style={{ color: muted, fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}>Back</button>
                <button onClick={nextStep} data-coach="goto-decrypt" style={{ background: primary, color: '#fff', fontWeight: 800, padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                  Go to decryption
                </button>
              </div>
            </div>
          )}
        </div>
        <Calculator />
      </div>

      <Coach
        show={phase === 0 && !!text}
        anchorSelector='[data-coach="convert-btn"]'
        hintKey="enc-convert"
        side="top"
        message={<>You typed a message. Press <strong>Convert to numbers</strong> to turn each character into its ASCII code.</>}
      />

      <Coach
        show={phase >= 1 && !!active && active.cipher === null}
        anchorSelector='[data-coach="encrypt-task"]'
        hintKey={`enc-task-${activeBlock}`}
        side="top"
        message={<>Compute <code>C = M^e mod n</code> for the highlighted character. The calculator on the right understands <code>x^y%z</code>. Type the answer below.</>}
      />

      <Coach
        show={allDone}
        anchorSelector='[data-coach="goto-decrypt"]'
        hintKey="enc-finish"
        side="top"
        message={<>All characters encrypted. Continue to <strong>Decryption</strong> to recover the original message.</>}
      />
    </motion.div>
  );
}
