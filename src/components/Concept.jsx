import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Wrapper for the Discover → Reveal → Practice pedagogical pattern.
// Discover is always visible. Reveal expands on click. Practice (AnswerCheck)
// renders at the bottom. When discoverDone flips to true the card gets a green
// border and the "Got it" badge animates in.

export default function Concept({
  title,
  question,
  discover,
  reveal,
  practice,
  discoverDone = false,
  revealLabel = 'Reveal the rule',
  hideLabel = 'Hide the rule',
}) {
  const [showReveal, setShowReveal] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      background: 'var(--t-surface)',
      border: `1px solid ${discoverDone ? 'var(--t-accent)' : 'var(--t-border)'}`,
      borderRadius: '0.75rem',
      padding: '1.25rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'border-color 220ms ease',
    }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--t-text)' }}>
            {title}
          </h3>
          <AnimatePresence>
            {discoverDone && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'var(--t-accent)',
                  color: '#fff',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.05em',
                }}
              >
                Got it
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      {question && (
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: 'var(--t-text-muted)',
          lineHeight: 1.5,
        }}>
          {question}
        </p>
      )}

      <div>{discover}</div>

      {reveal && (
        <div style={{ borderTop: '1px dashed var(--t-border)', paddingTop: '0.75rem' }}>
          <button
            onClick={() => setShowReveal(v => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '999px',
              border: `1px solid var(--t-border)`,
              background: showReveal ? 'var(--t-primary-bg)' : 'var(--t-surface-alt)',
              color: 'var(--t-primary)',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
              {showReveal ? 'expand_less' : 'expand_more'}
            </span>
            {showReveal ? hideLabel : revealLabel}
          </button>
          <AnimatePresence initial={false}>
            {showReveal && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: '0.75rem' }}>{reveal}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {practice && (
        <div style={{ borderTop: '1px dashed var(--t-border)', paddingTop: '0.75rem' }}>
          {practice}
        </div>
      )}
    </div>
  );
}
