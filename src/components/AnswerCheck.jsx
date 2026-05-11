import { useState } from 'react';

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
    setShowSolution((showing) => {
      const next = !showing;
      if (next) {
        setStatus('idle');
        if (onRevealSolution) {
          onRevealSolution(solutionValue);
        } else if (onCorrect) {
          onCorrect(String(solutionValue));
        }
      }
      return next;
    });
  };

  return (
    <div style={{ border: '1px solid var(--t-border)', borderRadius: '0.5rem', padding: '1rem', background: 'var(--t-surface-alt)' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--t-text)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
        {label}
      </label>
      {hint && <p style={{ margin: '0 0 0.75rem', color: 'var(--t-text-muted)', fontSize: '0.8125rem', lineHeight: 1.5 }}>{hint}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setStatus('idle'); }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your answer"
          style={{ flex: '1 1 12rem', minWidth: 0, border: '1px solid var(--t-border)', borderRadius: '0.375rem', padding: '0.6rem 0.75rem', fontFamily: 'monospace', background: 'var(--t-bg)', color: 'var(--t-text)' }}
        />
        <button onClick={check} disabled={!canCheck} style={{ border: 'none', borderRadius: '0.375rem', padding: '0.6rem 0.9rem', fontWeight: 800, color: '#fff', background: !canCheck ? '#9ca3af' : 'var(--t-primary)', cursor: !canCheck ? 'not-allowed' : 'pointer' }}>
          Check
        </button>
        <button onClick={revealSolution} disabled={disabled} style={{ border: '1px solid var(--t-border)', borderRadius: '0.375rem', padding: '0.6rem 0.9rem', fontWeight: 800, color: 'var(--t-primary)', background: 'var(--t-surface)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
          {showSolution ? 'Hide solution' : 'Show solution'}
        </button>
      </div>
      {status === 'correct' && <p style={{ margin: '0.6rem 0 0', color: '#15803d', fontSize: '0.8125rem', fontWeight: 700 }}>Correct.</p>}
      {status === 'wrong' && <p style={{ margin: '0.6rem 0 0', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 700 }}>Not quite. Try again, or reveal the solution.</p>}
      {showSolution && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.375rem', background: 'var(--t-primary-bg)', color: 'var(--t-text)', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
          {formatSolution(expected)}
        </div>
      )}
    </div>
  );
}
