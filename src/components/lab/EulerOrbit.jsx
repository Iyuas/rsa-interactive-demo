import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Visualise why M^(e·d) mod n returns to M. We pick a small M and walk the
// orbit: M, M·M, M^3, M^4 ... all mod n, until we return to M. The orbit
// length divides φ(n), so after e·d ≡ 1 (mod φ(n)) steps we end where we
// started. Concept reported "understood" once the student watches the orbit
// close at least once.

export default function EulerOrbit({ n, e, d, onUnderstood }) {
  const safeN = Number(n);
  const orbitN = Math.min(safeN, 33);

  const [M, setM] = useState(2);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reportedRef = useRef(false);
  const timer = useRef(null);

  const orbit = useMemo(() => {
    const out = [];
    let v = M % orbitN;
    if (v < 0) v += orbitN;
    const start = v;
    out.push(start);
    while (out.length < 200) {
      v = (v * M) % orbitN;
      out.push(v);
      if (v === start && out.length > 1) break;
    }
    return out;
  }, [M, orbitN]);

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
    reportedRef.current = false;
  }, [M, orbitN]);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= orbit.length - 1) { setPlaying(false); return; }
    timer.current = setTimeout(() => setStepIdx(i => i + 1), 350);
    return () => clearTimeout(timer.current);
  }, [playing, stepIdx, orbit.length]);

  useEffect(() => {
    if (stepIdx >= orbit.length - 1 && stepIdx > 0 && !reportedRef.current && onUnderstood) {
      reportedRef.current = true;
      onUnderstood();
    }
  }, [stepIdx, orbit.length, onUnderstood]);

  const positions = Array.from({ length: orbitN }, (_, i) => {
    const angle = (i / orbitN) * 2 * Math.PI - Math.PI / 2;
    return {
      i,
      x: Math.cos(angle) * 110,
      y: Math.sin(angle) * 110,
    };
  });

  const accent = 'var(--t-primary)';
  const accent2 = 'var(--t-accent)';
  const muted = 'var(--t-text-muted)';

  const visited = orbit.slice(0, stepIdx + 1);
  const head = visited[visited.length - 1];
  const start = orbit[0];
  const closed = stepIdx > 0 && head === start;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--t-text)' }}>
          M =
          <input
            type="number"
            min={2}
            max={orbitN - 1}
            value={M}
            onChange={(ev) => setM(Math.max(2, Math.min(orbitN - 1, Number(ev.target.value) || 2)))}
            style={{
              width: '4rem',
              marginLeft: '0.4rem',
              padding: '0.3rem 0.5rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              border: '1px solid var(--t-border)',
              borderRadius: '0.375rem',
              background: 'var(--t-bg)',
              color: 'var(--t-text)',
            }}
          />
        </label>
        <span style={{ fontSize: '0.75rem', color: muted }}>
          inside ℤ<sub>{orbitN}</sub>{safeN > orbitN && <> (capped for display)</>}
        </span>
        <button
          onClick={() => setPlaying(p => !p)}
          disabled={closed}
          style={ctrl(closed)}
        >
          {playing ? 'Pause' : 'Run orbit'}
        </button>
        <button onClick={() => { setStepIdx(0); setPlaying(false); }} style={ctrl(false)}>Reset</button>
      </div>

      <svg viewBox="-140 -140 280 280" style={{ width: 280, height: 280 }}>
        <circle cx={0} cy={0} r={110} fill="none" stroke="var(--t-border)" strokeWidth={1} />
        {positions.map(p => (
          <g key={p.i}>
            <circle cx={p.x} cy={p.y} r={9} fill="var(--t-surface-alt)" stroke="var(--t-border)" />
            <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--t-text-muted)" fontFamily="monospace">{p.i}</text>
          </g>
        ))}
        {visited.slice(0, -1).map((from, i) => {
          const to = visited[i + 1];
          const pf = positions[from];
          const pt = positions[to];
          if (!pf || !pt) return null;
          return (
            <motion.line
              key={`${i}-${from}-${to}`}
              x1={pf.x} y1={pf.y}
              x2={pt.x} y2={pt.y}
              stroke={accent}
              strokeWidth={1.5}
              opacity={0.4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25 }}
            />
          );
        })}
        {visited.map((v, i) => {
          const p = positions[v];
          if (!p) return null;
          const isHead = i === visited.length - 1;
          const isStart = v === start;
          return (
            <motion.circle
              key={`v-${i}`}
              cx={p.x}
              cy={p.y}
              initial={{ r: 0 }}
              animate={{ r: isHead ? 14 : isStart ? 11 : 9 }}
              transition={{ duration: 0.2 }}
              fill={isHead ? accent2 : isStart ? accent : 'var(--t-primary-bg)'}
              stroke={isHead ? accent2 : accent}
              strokeWidth={isHead ? 2 : 1}
            />
          );
        })}
      </svg>

      <div style={{
        background: closed ? '#f0fdf4' : 'var(--t-surface-alt)',
        border: `1px solid ${closed ? accent2 : 'var(--t-border)'}`,
        borderRadius: '0.5rem',
        padding: '0.55rem 0.85rem',
        fontFamily: 'monospace',
        fontSize: '0.8125rem',
        color: 'var(--t-text)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '24rem',
      }}>
        Step {stepIdx}: M^{stepIdx + 1} mod {orbitN} = <strong style={{ color: closed ? accent2 : accent }}>{head}</strong>
        <AnimatePresence>
          {closed && (
            <motion.div
              key="closed"
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: accent2, fontWeight: 800 }}
            >
              Orbit closed after {stepIdx} steps — we are back at the start. After (e · d) steps the orbit always closes; that's why C<sup>d</sup> ≡ M.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {e && d && (
        <p style={{ fontSize: '0.7rem', color: muted, textAlign: 'center', maxWidth: '24rem' }}>
          On the real key, e·d = {String(BigInt(e) * BigInt(d))}. After that many multiplications by M, we return to M — that is the formal statement of Euler's theorem at the heart of RSA decryption.
        </p>
      )}
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
