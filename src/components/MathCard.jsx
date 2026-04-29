import { motion } from 'framer-motion';

export default function MathCard({ title, expression, value, note, tone = 'blue' }) {
  const toneStyles = {
    blue: { borderColor: 'var(--t-primary)', background: 'var(--t-primary-bg)', color: 'var(--t-primary)' },
    green: { borderColor: '#22c55e', background: '#f0fdf4', color: '#15803d' },
    red: { borderColor: '#ef4444', background: '#fef2f2', color: '#dc2626' },
    gray: { borderColor: 'var(--t-border)', background: 'var(--t-surface-alt)', color: 'var(--t-text-muted)' },
  };
  const s = toneStyles[tone] || toneStyles.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        borderLeft: `4px solid ${s.borderColor}`,
        borderRadius: '0 0.5rem 0.5rem 0',
        padding: '1rem',
        background: s.background,
        color: s.color,
      }}
    >
      {title && <h5 style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', margin: '0 0 0.5rem' }}>{title}</h5>}
      {expression && <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{expression}</div>}
      {value !== undefined && value !== null && (
        <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900 }}>{String(value)}</div>
      )}
      {note && <p style={{ fontSize: '0.75rem', color: 'var(--t-text-muted)', marginTop: '0.5rem', lineHeight: 1.5, marginBottom: 0 }}>{note}</p>}
    </motion.div>
  );
}
