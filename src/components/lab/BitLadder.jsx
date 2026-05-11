import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modPowTrace } from '../../utils/rsaMath';

// Bit-by-bit visualisation of square-and-multiply. Takes base, exp, modulus.
// Renders the exponent's bits as a ladder. The student presses Step / Auto and
// watches: every step squares the running result, and a 1-bit also multiplies
// by base. After the student walks at least 3 steps we mark the concept learned.

export default function BitLadder({ base, exponent, modulus, onUnderstood }) {
  const trace = useMemo(
    () => modPowTrace(BigInt(base), BigInt(exponent), BigInt(modulus)),
    [base, exponent, modulus],
  );
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reportedRef = useRef(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    if (step >= trace.steps.length) { setPlaying(false); return; }
    timer.current = setTimeout(() => setStep(s => s + 1), 700);
    return () => clearTimeout(timer.current);
  }, [playing, step, trace.steps.length]);

  useEffect(() => {
    if (step >= 3 && !reportedRef.current && onUnderstood) {
      reportedRef.current = true;
      onUnderstood();
    }
  }, [step, onUnderstood]);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
    reportedRef.current = false;
  }, [base, exponent, modulus]);

  const bits = trace.binary;
  const current = step > 0 ? trace.steps[step - 1] : null;
  const finished = step >= trace.steps.length;
  const finalResult = trace.result;

  const accent = 'var(--t-primary)';
  const muted = 'var(--t-text-muted)';
  const surface = 'var(--t-surface-alt)';
  const accent2 = 'var(--t-accent)';

  const bitsCovered = current ? current.bitIndex : -1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: 'var(--t-text)',
        }}>
          <span style={{ color: muted }}>Computing</span>{' '}
          <strong style={{ color: accent }}>{base}<sup>{exponent}</sup> mod {modulus}</strong>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={btn(step === 0)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_left</span>
          </button>
          <button
            onClick={() => setStep(s => Math.min(trace.steps.length, s + 1))}
            disabled={finished}
            style={btn(finished)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
            Step
          </button>
          <button
            onClick={() => setPlaying(p => !p)}
            disabled={finished}
            style={{ ...btn(finished), background: playing ? accent : 'var(--t-surface)', color: playing ? '#fff' : accent }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
              {playing ? 'pause' : 'play_arrow'}
            </span>
            Auto
          </button>
          <button
            onClick={() => { setStep(0); setPlaying(false); }}
            style={btn(false)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>restart_alt</span>
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.625rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
          Bits of exponent {exponent}: {bits} (the leftmost bit is read first)
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {bits.split('').map((bit, i) => {
            const passed = i < bitsCovered;
            const active = i === bitsCovered;
            const isOne = bit === '1';
            return (
              <motion.div
                key={i}
                animate={{
                  scale: active ? 1.12 : 1,
                  backgroundColor: active
                    ? (isOne ? accent2 : accent)
                    : passed
                      ? (isOne ? '#f0fdf4' : 'var(--t-primary-bg)')
                      : surface,
                  color: active ? '#fff' : 'var(--t-text)',
                }}
                transition={{ duration: 0.2 }}
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${active ? accent : 'var(--t-border)'}`,
                  borderRadius: '0.4rem',
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '1rem',
                }}
              >
                {bit}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div style={{
        background: surface,
        border: '1px solid var(--t-border)',
        borderRadius: '0.5rem',
        padding: '0.85rem',
        minHeight: '4.5rem',
      }}>
        <AnimatePresence mode="wait">
          {!current && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: '0.8125rem', color: muted, fontFamily: 'monospace' }}
            >
              Start: result = 1. Press "Step" to use the first bit.
            </motion.div>
          )}
          {current && (
            <motion.div
              key={`s-${step}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
            >
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: muted, textTransform: 'uppercase' }}>
                Bit #{current.bitIndex + 1} ({current.bit}) — {current.op === 'square' ? 'square the result' : `multiply by ${base}`}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--t-text)' }}>
                result = {' '}
                {current.op === 'square'
                  ? <>({String(current.before)})<sup>2</sup> mod {modulus} = <strong style={{ color: accent }}>{String(current.after)}</strong></>
                  : <>{String(current.before)} · {base} mod {modulus} = <strong style={{ color: accent2 }}>{String(current.after)}</strong></>
                }
              </div>
              <div style={{ fontSize: '0.75rem', color: muted }}>
                {current.op === 'square'
                  ? 'We square on EVERY bit.'
                  : 'We multiply by base only when the bit is 1.'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {finished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'var(--t-primary-bg)',
            border: `2px solid ${accent}`,
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ fontSize: '0.625rem', fontWeight: 800, color: accent, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Result
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--t-text)' }}>
            {base}<sup>{exponent}</sup> mod {modulus} = {String(finalResult)}
          </div>
          <div style={{ fontSize: '0.7rem', color: muted, marginTop: '0.25rem' }}>
            {trace.steps.length} bit steps instead of about {exponent} repeated multiplications
          </div>
        </motion.div>
      )}
    </div>
  );
}

function btn(disabled) {
  return {
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
    background: 'var(--t-surface)',
    color: disabled ? 'var(--t-text-muted)' : 'var(--t-primary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
