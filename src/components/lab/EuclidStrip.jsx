import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extGcdTrace } from '../../utils/rsaMath';

// Animated strip of divisions for the extended Euclidean algorithm.
// Phase 1 (forward): each click pushes another row showing dividend / divisor = quotient remainder.
// Phase 2 (back-substitution): once forward done, the strip flips and reads the rows in reverse,
// each step expressing the remainder as a combination of the original a and b.
// The student is "done" after walking at least 3 rows.

export default function EuclidStrip({ a, b, onUnderstood, forwardOnly = false }) {
  const trace = useMemo(() => extGcdTrace(BigInt(a), BigInt(b)), [a, b]);
  const rows = trace.table.slice(1);     // skip the seed row
  const backRows = trace.backSub;

  const [forwardIdx, setForwardIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [backIdx, setBackIdx] = useState(0);
  const reportedRef = useRef(false);

  useEffect(() => {
    if (forwardIdx >= 3 && !reportedRef.current && onUnderstood) {
      reportedRef.current = true;
      onUnderstood();
    }
  }, [forwardIdx, onUnderstood]);

  useEffect(() => {
    setForwardIdx(0);
    setShowBack(false);
    setBackIdx(0);
    reportedRef.current = false;
  }, [a, b]);

  const muted = 'var(--t-text-muted)';
  const accent = 'var(--t-primary)';

  const visibleRows = rows.slice(0, forwardIdx);
  const forwardDone = forwardIdx >= rows.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: muted, lineHeight: 1.45 }}>
        Forward pass — divide the larger number by the smaller, record the remainder, repeat until the remainder hits 0. The last non-zero remainder is GCD(a, b).
      </p>

      <div style={{
        background: 'var(--t-surface-alt)',
        border: '1px solid var(--t-border)',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        fontFamily: 'monospace',
        fontSize: '0.8125rem',
        minHeight: '4rem',
      }}>
        {visibleRows.length === 0 && (
          <span style={{ color: muted }}>Press "Next step" to start.</span>
        )}
        <AnimatePresence initial={false}>
          {visibleRows.map((row, i) => {
            const prev = i === 0 ? { oldR: BigInt(a), r: BigInt(b) } : rows[i - 1];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ padding: '0.2rem 0', borderBottom: i < visibleRows.length - 1 ? '1px dashed var(--t-border)' : 'none', color: 'var(--t-text)' }}
              >
                {String(prev.oldR)} = {String(row.q)} · {String(prev.r)} + <strong style={{ color: row.r === 0n ? accent : 'var(--t-text)' }}>{String(row.r)}</strong>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setForwardIdx(i => Math.min(rows.length, i + 1))}
          disabled={forwardDone}
          style={ctrl(forwardDone)}
        >
          Next step
        </button>
        <button
          onClick={() => { setForwardIdx(0); setShowBack(false); setBackIdx(0); }}
          style={ctrl(false)}
        >
          Reset
        </button>
        {forwardDone && !forwardOnly && (
          <button
            onClick={() => setShowBack(v => !v)}
            style={{ ...ctrl(false), background: showBack ? accent : 'var(--t-surface)', color: showBack ? '#fff' : accent }}
          >
            {showBack ? 'Hide' : 'Run'} back-substitution
          </button>
        )}
      </div>

      {forwardDone && (
        <div style={{
          background: 'var(--t-primary-bg)',
          border: `1px solid ${accent}`,
          borderRadius: '0.5rem',
          padding: '0.6rem 0.85rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: 'var(--t-text)',
        }}>
          GCD({String(a)}, {String(b)}) = <strong style={{ color: accent }}>{String(trace.gcd)}</strong>
          {trace.gcd === 1n && <> · {String(a)} and {String(b)} are coprime</>}
        </div>
      )}

      <AnimatePresence>
        {showBack && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--t-surface-alt)',
              border: '1px dashed var(--t-border)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              display: 'flex', flexDirection: 'column', gap: '0.35rem',
            }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Express each remainder as a · s + b · t (top to bottom):
              </div>
              {backRows.slice(0, backIdx + 1).map((row, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                  {String(row.remainder)} = {String(row.dividend)} − {String(row.quotient)} · {String(row.divisor)}
                </motion.div>
              ))}
              {backIdx < backRows.length - 1 && (
                <button onClick={() => setBackIdx(i => i + 1)} style={{ ...ctrl(false), alignSelf: 'flex-start', marginTop: '0.35rem' }}>
                  Next back-sub step
                </button>
              )}
              {backIdx >= backRows.length - 1 && (
                <div style={{ marginTop: '0.35rem', color: accent, fontWeight: 800 }}>
                  Chain complete · coefficients: s = {String(trace.x)}, t = {String(trace.y)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ctrl(disabled) {
  return {
    padding: '0.4rem 0.85rem',
    borderRadius: '0.4rem',
    border: '1px solid var(--t-border)',
    background: 'var(--t-surface)',
    color: disabled ? 'var(--t-text-muted)' : 'var(--t-primary)',
    fontWeight: 800,
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
