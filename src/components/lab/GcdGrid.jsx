import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gcdTrace } from '../../utils/rsaMath';

// Grid of integers 2..n-1. The student hovers/clicks a number — the widget
// highlights it green if gcd(number, target) === 1 (coprime) and red otherwise.
// Used in two places:
//   * Compute φ(n) by clicking everything that is coprime with n.
//   * Pick e by spotting a number coprime with φ(n).
// The widget reports "understood" once the student has correctly identified
// `pickGoal` coprime numbers (default 1).

export default function GcdGrid({
  target,                // BigInt or number to test gcd against
  min = 2,
  max,                   // upper bound (exclusive). Defaults to target.
  pickGoal = 1,          // how many coprime numbers the student must spot
  onUnderstood,
  onPick,                // optional: notified with each correct pick
  cap = 60,              // visual safety cap on grid size
}) {
  const upper = Number(max != null ? max : target);
  const lower = Number(min);
  const overflow = upper - lower > cap;
  const effectiveMax = overflow ? lower + cap : upper;

  const [hovered, setHovered] = useState(null);
  const [picked, setPicked] = useState(new Set());
  const reportedRef = useRef(false);

  useEffect(() => {
    if (picked.size >= pickGoal && !reportedRef.current && onUnderstood) {
      reportedRef.current = true;
      onUnderstood();
    }
  }, [picked.size, pickGoal, onUnderstood]);

  const checkCoprime = (x) => {
    try {
      return gcdTrace(BigInt(x), BigInt(target)).gcd === 1n;
    } catch {
      return false;
    }
  };

  const handleClick = (x) => {
    const coprime = checkCoprime(x);
    if (coprime) {
      setPicked((s) => {
        if (s.has(x)) return s;
        const next = new Set(s); next.add(x);
        if (onPick) onPick(x);
        return next;
      });
    }
  };

  const muted = 'var(--t-text-muted)';
  const accent = 'var(--t-accent)';
  const accentBg = '#f0fdf4';
  const primary = 'var(--t-primary)';
  const primaryBg = 'var(--t-primary-bg)';
  const dangerBg = '#fef2f2';
  const danger = '#dc2626';

  const cells = [];
  for (let x = lower; x < effectiveMax; x++) cells.push(x);

  const hoveredCoprime = hovered != null ? checkCoprime(hovered) : null;
  const hoveredGcd = hovered != null ? Number(gcdTrace(BigInt(hovered), BigInt(target)).gcd) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: muted, lineHeight: 1.45 }}>
        Hover over a number to see gcd(x, {String(target)}). Click numbers that are coprime with {String(target)} — green when correct.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(10, cells.length)}, 1fr)`,
        gap: '4px',
      }}>
        {cells.map(x => {
          const coprime = checkCoprime(x);
          const isPicked = picked.has(x);
          const isHover = hovered === x;
          return (
            <motion.button
              key={x}
              whileTap={{ scale: 0.94 }}
              onMouseEnter={() => setHovered(x)}
              onMouseLeave={() => setHovered((h) => h === x ? null : h)}
              onClick={() => handleClick(x)}
              style={{
                aspectRatio: '1',
                border: `1px solid ${isPicked ? accent : isHover ? (coprime ? accent : danger) : 'var(--t-border)'}`,
                borderRadius: '0.35rem',
                background: isPicked ? accentBg : isHover ? (coprime ? accentBg : dangerBg) : 'var(--t-surface)',
                color: 'var(--t-text)',
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              {x}
            </motion.button>
          );
        })}
      </div>

      {overflow && (
        <p style={{ fontSize: '0.7rem', color: muted, margin: 0 }}>
          Showing the first {cap} numbers. With large φ(n) we cannot fit every value on screen — the same rule applies to the rest.
        </p>
      )}

      <div style={{
        background: hovered == null ? 'var(--t-surface-alt)' : hoveredCoprime ? primaryBg : dangerBg,
        border: `1px solid ${hovered == null ? 'var(--t-border)' : hoveredCoprime ? primary : danger}`,
        borderRadius: '0.4rem',
        padding: '0.55rem 0.85rem',
        fontFamily: 'monospace',
        fontSize: '0.8125rem',
        color: 'var(--t-text)',
        minHeight: '2.5rem',
        display: 'flex',
        alignItems: 'center',
      }}>
        {hovered == null
          ? <span style={{ color: muted }}>Hover a cell to inspect gcd</span>
          : <span>
              gcd({hovered}, {String(target)}) = <strong style={{ color: hoveredCoprime ? primary : danger }}>{hoveredGcd}</strong>
              {' · '}
              {hoveredCoprime ? <span style={{ color: primary, fontWeight: 800 }}>coprime ✓</span> : <span style={{ color: danger, fontWeight: 800 }}>shares a divisor ✗</span>}
            </span>}
      </div>

      <div style={{ fontSize: '0.75rem', color: muted, fontFamily: 'monospace' }}>
        Picked so far: <strong style={{ color: 'var(--t-text)' }}>{picked.size ? Array.from(picked).sort((a, b) => a - b).join(', ') : '—'}</strong>
        {pickGoal > 1 && <> · target: {pickGoal}</>}
      </div>
    </div>
  );
}
