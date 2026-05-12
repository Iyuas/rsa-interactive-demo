import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Idle coach-mark. After `idleMs` of no user activity (mousemove/keydown/click)
// the bubble appears anchored to the element matching `anchorSelector`. Hides
// when the activity timer resets or the user dismisses with the X button.
// `show` is the gating condition: only when true does the coach watch idle.
// `hintKey` lets the user dismiss permanently per browser-session.

function useIdle(idleMs, active) {
  const [idle, setIdle] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!active) { setIdle(false); return; }
    const reset = () => {
      setIdle(false);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setIdle(true), idleMs);
    };
    reset();
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [idleMs, active]);

  return idle;
}

export default function Coach({
  show,
  anchorSelector,
  message,
  idleMs = 12000,
  hintKey,
  side = 'bottom',
}) {
  const idle = useIdle(idleMs, show);
  const [dismissed, setDismissed] = useState(() => {
    if (!hintKey) return false;
    try {
      return sessionStorage.getItem(`coach-dismissed-${hintKey}`) === '1';
    } catch { return false; }
  });
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!idle || dismissed || !show) { setPos(null); return; }
    const measure = () => {
      const el = anchorSelector ? document.querySelector(anchorSelector) : null;
      if (!el) { setPos(null); return; }
      const r = el.getBoundingClientRect();
      setPos({
        top: side === 'top' ? r.top + window.scrollY - 8 : r.bottom + window.scrollY + 8,
        left: r.left + window.scrollX + r.width / 2,
        anchorRect: r,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [idle, dismissed, show, anchorSelector, side]);

  const dismiss = () => {
    setDismissed(true);
    if (hintKey) {
      try { sessionStorage.setItem(`coach-dismissed-${hintKey}`, '1'); } catch { /* noop */ }
    }
  };

  const visible = show && idle && !dismissed && pos;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* spotlight ring around the anchor */}
          <motion.div
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              top: pos.anchorRect.top + window.scrollY - 6,
              left: pos.anchorRect.left + window.scrollX - 6,
              width: pos.anchorRect.width + 12,
              height: pos.anchorRect.height + 12,
              borderRadius: '0.75rem',
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.18), 0 0 0 3px var(--t-primary)',
              pointerEvents: 'none',
              zIndex: 95,
              transition: 'all 200ms ease',
            }}
          />
          {/* the bubble */}
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: side === 'top' ? 6 : -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              transform: side === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
              maxWidth: '20rem',
              minWidth: '14rem',
              background: 'var(--t-surface)',
              border: '1px solid var(--t-primary)',
              borderRadius: '0.6rem',
              padding: '0.7rem 0.85rem 0.6rem',
              boxShadow: '0 16px 32px rgba(15,23,42,0.22)',
              zIndex: 96,
              fontSize: '0.8125rem',
              lineHeight: 1.45,
              color: 'var(--t-text)',
            }}
          >
            <button
              onClick={dismiss}
              aria-label="Dismiss hint"
              style={{
                position: 'absolute',
                top: 2,
                right: 4,
                width: 22,
                height: 22,
                border: 'none',
                background: 'transparent',
                color: 'var(--t-text-muted)',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
                padding: 0,
              }}
            >×</button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.625rem',
              fontWeight: 900,
              color: 'var(--t-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.3rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>lightbulb</span>
              Hint
            </div>
            <div>{message}</div>

            {/* arrow */}
            <span
              style={{
                position: 'absolute',
                top: side === 'top' ? '100%' : -7,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: 12,
                height: 12,
                background: 'var(--t-surface)',
                borderTop: side === 'top' ? 'none' : '1px solid var(--t-primary)',
                borderLeft: side === 'top' ? 'none' : '1px solid var(--t-primary)',
                borderBottom: side === 'top' ? '1px solid var(--t-primary)' : 'none',
                borderRight: side === 'top' ? '1px solid var(--t-primary)' : 'none',
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
