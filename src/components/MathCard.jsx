import { motion } from 'framer-motion';

export default function MathCard({ title, expression, value, note, tone = 'blue' }) {
  const toneClasses = {
    blue: 'border-[#003d9b] bg-[#f1f3ff] text-[#003d9b]',
    green: 'border-green-500 bg-green-50 text-green-700',
    red: 'border-red-500 bg-red-50 text-red-700',
    gray: 'border-gray-300 bg-gray-50 text-gray-700',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`border-l-4 rounded-r-lg p-4 shadow-sm ${toneClasses[tone]}`}
    >
      {title && <h5 className="text-xs font-bold uppercase tracking-wider mb-2">{title}</h5>}
      {expression && <div className="font-mono text-sm mb-1">{expression}</div>}
      {value !== undefined && value !== null && (
        <div className="font-mono text-2xl font-black">{String(value)}</div>
      )}
      {note && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{note}</p>}
    </motion.div>
  );
}
