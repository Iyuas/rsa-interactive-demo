import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnswerCheck({
  label,
  hint,
  expected,
  validate,
  normalize = (value) => value.trim(),
  formatSolution = (value) => String(value),
  onCorrect,
  onRevealSolution,
  solutionValue = expected,
  disabled = false,
}) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle');
  const [showSolution, setShowSolution] = useState(false);

  const check = () => {
    const ok = validate ? validate(value) : normalize(value) === normalize(String(expected));
    setStatus(ok ? 'correct' : 'wrong');
    if (ok && onCorrect) onCorrect(value);
  };

  const canCheck = !disabled && value.trim();

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && canCheck) {
      event.preventDefault();
      check();
    }
  };

  const revealSolution = () => {
    if (showSolution) {
      setShowSolution(false);
      return;
    }
    setShowSolution(true);
    setStatus('idle');
    if (onRevealSolution) {
      onRevealSolution(solutionValue);
    } else if (onCorrect) {
      onCorrect(String(solutionValue));
    }
  };

  const isCorrect = status === 'correct';
  const isWrong = status === 'wrong';

  // Container styling reacts to status
  const containerBorder = isCorrect
    ? 'var(--t-accent)'
    : isWrong
      ? '#dc2626'
      : 'var(--t-border)';
  const containerBg = isCorrect
    ? 'linear-gradient(135deg, #f0fdf4 0%, var(--t-surface-alt) 100%)'
    : 'var(--t-surface-alt)';
  const containerShadow = isCorrect
    ? '0 0 0 4px rgba(34, 197, 94, 0.18), 0 8px 18px rgba(34, 197, 94, 0.18)'
    : 'none';

  return (
    <motion.div
      animate={
        isCorrect
          ? { scale: [1, 1.025, 1] }
          : isWrong
            ? { x: [-4, 4, -3, 3, 0] }
            : { scale: 1, x: 0 }
      }
      transition={
        isCorrect
          ? { duration: 0.35, times: [0, 0.4, 1], ease: 'easeOut' }
          : isWrong
            ? { duration: 0.32 }
            : { duration: 0.2 }
      }
      style={{
        position: 'relative',
        border: `2px solid ${containerBorder}`,
        borderRadius: '0.55rem',
        padding: '1rem',
        background: containerBg,
        boxShadow: containerShadow,
        transition: 'border-color 220ms ease, background 220ms ease, box-shadow 280ms ease',
        overflow: 'hidden',
      }}
    >
      {/* sweep highlight on correct */}
      <AnimatePresence>
        {isCorrect && (
          <motion.div
            key="sweep"
            initial={{ x: '-110%' }}
            animate={{ x: '110%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '60%',
              height: '100%',
              background: 'linear-gradient(120deg, transparent 0%, rgba(34, 197, 94, 0.18) 50%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--t-text)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
        {label}
      </label>
      {hint && <p style={{ margin: '0 0 0.75rem', color: 'var(--t-text-muted)', fontSize: '0.8125rem', lineHeight: 1.5 }}>{hint}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', position: 'relative' }}>
        <motion.input
          value={value}
          onChange={(e) => { setValue(e.target.value); setStatus('idle'); }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your answer"
          animate={
            isCorrect
              ? { borderColor: 'var(--t-accent)', boxShadow: '0 0 0 3px rgba(34,197,94,0.25)' }
              : isWrong
                ? { borderColor: '#dc2626', boxShadow: '0 0 0 3px rgba(220,38,38,0.18)' }
                : { borderColor: 'var(--t-border)', boxShadow: '0 0 0 0 rgba(0,0,0,0)' }
          }
          transition={{ duration: 0.22 }}
          style={{
            flex: '1 1 12rem',
            minWidth: 0,
            border: '2px solid var(--t-border)',
            borderRadius: '0.4rem',
            padding: '0.6rem 0.75rem',
            fontFamily: 'monospace',
            background: 'var(--t-bg)',
            color: 'var(--t-text)',
            outline: 'none',
          }}
        />
        <button
          onClick={check}
          disabled={!canCheck}
          style={{
            border: 'none',
            borderRadius: '0.4rem',
            padding: '0.6rem 0.9rem',
            fontWeight: 800,
            color: '#fff',
            background: !canCheck ? '#9ca3af' : isCorrect ? 'var(--t-accent)' : 'var(--t-primary)',
            cursor: !canCheck ? 'not-allowed' : 'pointer',
            transition: 'background-color 220ms ease',
          }}
        >
          {isCorrect ? '✓ Checked' : 'Check'}
        </button>
        <button
          onClick={revealSolution}
          disabled={disabled}
          style={{
            border: '1px solid var(--t-border)',
            borderRadius: '0.4rem',
            padding: '0.6rem 0.9rem',
            fontWeight: 800,
            color: 'var(--t-primary)',
            background: 'var(--t-surface)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {showSolution ? 'Hide solution' : 'Show solution'}
        </button>
      </div>

      <AnimatePresence>
        {isCorrect && (
          <motion.div
            key="correct-badge"
            initial={{ opacity: 0, scale: 0.7, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 380, damping: 22 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginTop: '0.65rem',
              padding: '0.3rem 0.7rem',
              borderRadius: '999px',
              background: 'var(--t-accent)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(34,197,94,0.35)',
            }}
          >
            <motion.span
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 500, damping: 18 }}
              className="material-symbols-outlined"
              style={{ fontSize: '1rem' }}
            >
              check_circle
            </motion.span>
            Correct!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWrong && (
          <motion.p
            key="wrong-msg"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ margin: '0.6rem 0 0', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 700 }}
          >
            Not quite. Try again, or reveal the solution.
          </motion.p>
        )}
      </AnimatePresence>

      {showSolution && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.375rem', background: 'var(--t-primary-bg)', color: 'var(--t-text)', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap', position: 'relative' }}>
          {formatSolution(expected)}
        </div>
      )}
    </motion.div>
  );
}
