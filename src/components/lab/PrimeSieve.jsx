import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Sieve of Eratosthenes. The student crosses out multiples by clicking a row;
// the survivors are the primes. We bound the visualisation to a small N so it
// stays readable. The widget reports the concept as "understood" after the user
// has crossed out at least one row themselves.

const N = 50;

function buildInitial() {
  const composite = new Set();
  return { composite, crossed: new Set() };
}

export default function PrimeSieve({ onUnderstood }) {
  const [{ composite, crossed }, setState] = useState(buildInitial);
  const reportedRef = useRef(false);

  const isCrossed = (x) => composite.has(x);

  useEffect(() => {
    if (crossed.size >= 1 && !reportedRef.current && onUnderstood) {
      reportedRef.current = true;
      onUnderstood();
    }
  }, [crossed.size, onUnderstood]);

  const crossOutMultiples = (base) => {
    if (base < 2 || isCrossed(base) || crossed.has(base)) return;
    setState((s) => {
      const next = new Set(s.composite);
      for (let k = base * 2; k <= N; k += base) next.add(k);
      const newCrossed = new Set(s.crossed); newCrossed.add(base);
      return { composite: next, crossed: newCrossed };
    });
  };

  const reset = () => setState(buildInitial());

  const accent = 'var(--t-primary)';
  const muted = 'var(--t-text-muted)';
  const surface = 'var(--t-surface-alt)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: muted, lineHeight: 1.45 }}>
        Click any prime number below and the widget crosses out all of its multiples.
        Anything not crossed out is also prime. Try clicking 2, then 3, then 5.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gap: '4px',
      }}>
        {Array.from({ length: N }, (_, i) => i + 1).map(num => {
          const c = isCrossed(num);
          const selfCrossed = crossed.has(num);
          const isOne = num === 1;
          return (
            <motion.button
              key={num}
              whileTap={{ scale: 0.94 }}
              onClick={() => crossOutMultiples(num)}
              disabled={c || isOne}
              style={{
                position: 'relative',
                aspectRatio: '1',
                border: `1px solid ${selfCrossed ? accent : 'var(--t-border)'}`,
                borderRadius: '0.35rem',
                background: selfCrossed ? accent : c ? surface : 'var(--t-surface)',
                color: selfCrossed ? '#fff' : c ? muted : 'var(--t-text)',
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: c || isOne ? 'default' : 'pointer',
                textDecoration: c && !selfCrossed ? 'line-through' : 'none',
                opacity: isOne ? 0.4 : 1,
              }}
              title={isOne ? '1 is neither prime nor composite' : c ? 'crossed out — composite' : 'click to cross out its multiples'}
            >
              {num}
            </motion.button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.35rem 0.75rem',
            border: '1px solid var(--t-border)',
            borderRadius: '0.4rem',
            background: 'var(--t-surface)',
            color: accent,
            fontWeight: 800,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        <span style={{ fontSize: '0.75rem', color: muted, fontFamily: 'monospace' }}>
          Primes you used as seeds: {crossed.size ? Array.from(crossed).sort((a, b) => a - b).join(', ') : '—'}
        </span>
      </div>
    </div>
  );
}
