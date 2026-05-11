import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Clickable glossary term. Hover (150 ms delay) or click opens a popover with
// a one-paragraph explanation. Used inline inside instructional copy so that
// any unfamiliar term is one tap away from a definition.

const TERMS = {
  prime: {
    title: 'Prime number',
    body: 'A prime number is a whole number greater than 1 with exactly two divisors: 1 and itself. Examples: 2, 3, 5, 7, 11, 13. The number 9 is not prime — it is divisible by 3.',
  },
  mod: {
    title: 'mod (remainder of division)',
    body: 'a mod n is the remainder when a is divided by n. For example, 17 mod 5 = 2 because 17 = 3·5 + 2.',
  },
  gcd: {
    title: 'GCD (greatest common divisor)',
    body: 'The largest number that divides both numbers evenly. GCD(12, 18) = 6. When GCD(a, b) = 1 the numbers are called coprime.',
  },
  coprime: {
    title: 'Coprime numbers',
    body: 'Two numbers whose GCD is 1, meaning they share no common divisor other than 1. Example: 8 and 15 are coprime even though both are composite.',
  },
  phi: {
    title: 'Euler totient φ(n)',
    body: 'Read φ as "phi". It counts the numbers from 1 to n−1 that are coprime with n. For a prime p: φ(p) = p − 1. For n = p·q with distinct primes: φ(n) = (p−1)(q−1).',
  },
  modinv: {
    title: 'Modular inverse',
    body: 'A number d such that (e·d) mod φ = 1. In other words, e and d cancel each other modulo φ(n). Found with the extended Euclidean algorithm.',
  },
  euclid: {
    title: 'Euclidean algorithm',
    body: 'A way to find the GCD of two numbers via repeated division with remainder. Replace the larger number by the remainder until the remainder is 0 — the previous one is the GCD.',
  },
  extgcd: {
    title: 'Extended Euclidean algorithm',
    body: 'The same Euclidean process, but it also finds coefficients s, t such that s·a + t·b = GCD(a, b). The coefficient on e gives the modular inverse.',
  },
  modpow: {
    title: 'Modular exponentiation',
    body: 'Computing a^b mod n. If done naively the numbers become enormous. Square-and-multiply reads the bits (the 0s and 1s in binary) of b from left to right: at every step it squares the running result, and when the bit is 1 it also multiplies by a — all reduced mod n.',
  },
  publickey: {
    title: 'Public key',
    body: 'The pair (e, n). Shared with everyone. Used by others to encrypt messages for you. The public key cannot decrypt them — it can only lock, not unlock.',
  },
  privatekey: {
    title: 'Private key',
    body: 'The pair (d, n). It is kept secret. The private key contains enough secret information to decrypt messages encrypted with the matching public key.',
  },
  ascii: {
    title: 'ASCII',
    body: 'A table that maps common English letters, digits, symbols, and control codes to numbers from 0 to 127. A = 65, B = 66, space = 32, ! = 33. Encoding text as numbers is what lets RSA encrypt it.',
  },
};

export default function Glossary({ term, children }) {
  const entry = TERMS[term];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hoverTimer = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  if (!entry) {
    return <span>{children}</span>;
  }

  const onEnter = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(true), 150);
  };
  const onLeave = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <span
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => setOpen(v => !v)}
      style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}
    >
      <span style={{
        borderBottom: '1px dotted var(--t-primary)',
        color: 'var(--t-primary)',
        fontWeight: 700,
      }}>
        {children || entry.title}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 60,
              minWidth: '18rem',
              maxWidth: '22rem',
              background: 'var(--t-surface)',
              border: '1px solid var(--t-border)',
              borderRadius: '0.5rem',
              padding: '0.75rem 0.875rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              color: 'var(--t-text)',
              fontWeight: 500,
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              cursor: 'auto',
              display: 'block',
            }}
          >
            <span style={{
              display: 'block',
              fontSize: '0.625rem',
              fontWeight: 800,
              color: 'var(--t-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.25rem',
            }}>
              {entry.title}
            </span>
            <span style={{ display: 'block' }}>{entry.body}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
