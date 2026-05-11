import { motion } from 'framer-motion';

// Breadcrumb of the section state. Takes items [{ label, value, done }].
// Highlights done items and gently fades in each value when it appears.

export default function ProgressRail({ items }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      padding: '0.625rem 0.875rem',
      background: 'var(--t-surface-alt)',
      border: '1px solid var(--t-border)',
      borderRadius: '0.5rem',
      fontFamily: 'monospace',
      fontSize: '0.75rem',
    }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{
            color: it.done ? 'var(--t-primary)' : 'var(--t-text-muted)',
            fontWeight: 800,
          }}>{it.label}</span>
          <span style={{ color: 'var(--t-text-muted)' }}>=</span>
          <motion.span
            key={`${it.label}-${String(it.value)}`}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              color: it.done ? 'var(--t-text)' : 'var(--t-text-muted)',
              fontWeight: it.done ? 800 : 500,
            }}
          >
            {it.value === null || it.value === undefined ? '?' : String(it.value)}
          </motion.span>
          {i < items.length - 1 && (
            <span style={{ color: 'var(--t-border)', marginLeft: '0.4rem' }}>·</span>
          )}
        </div>
      ))}
    </div>
  );
}
