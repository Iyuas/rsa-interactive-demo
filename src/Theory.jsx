import { motion } from 'framer-motion';

const card = {
  background: 'var(--t-surface)',
  border: '1px solid var(--t-border)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const mathBlock = {
  background: 'var(--t-surface-alt)',
  border: '1px solid var(--t-border)',
  borderRadius: '0.5rem',
  padding: '0.75rem 1.25rem',
  fontFamily: 'monospace',
  fontSize: '1rem',
  color: 'var(--t-primary)',
  fontWeight: 700,
  margin: '0.25rem 0',
  overflowX: 'auto',
};

const sectionTitle = {
  fontSize: '1.125rem',
  fontWeight: 700,
  color: 'var(--t-text)',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const badge = (color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '50%',
  background: color,
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: 900,
  flexShrink: 0,
});

const p = {
  fontSize: '0.875rem',
  color: 'var(--t-text)',
  lineHeight: '1.6',
  margin: 0,
};

const muted = {
  fontSize: '0.8125rem',
  color: 'var(--t-text-muted)',
  lineHeight: '1.5',
  margin: 0,
};

export default function Theory() {
  const primary = 'var(--t-primary)';
  const textColor = 'var(--t-text)';
  const textMuted = 'var(--t-text-muted)';
  const border = 'var(--t-border)';
  const primaryBg = 'var(--t-primary-bg)';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: textColor, marginBottom: '0.5rem', marginTop: 0 }}>
          The RSA algorithm — theory
        </h2>
        <p style={{ ...muted, maxWidth: '52rem' }}>
          RSA is a public-key cryptosystem published in 1977 by Ron Rivest, Adi Shamir, and Leonard Adleman.
          Its security rests on the computational difficulty of factoring large composite numbers.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Overview */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span className="material-symbols-outlined" style={{ color: primary }}>info</span>
            What is RSA?
          </h3>
          <p style={p}>
            RSA is an <strong>asymmetric</strong> algorithm: it uses two different keys — a public one
            and a private one. The public key locks the message; the private key unlocks it.
            Anyone can have the public key and use it to encrypt messages, but only the holder of the
            matching private key can decrypt them.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: primaryBg, border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Public key</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: textColor, fontSize: '0.875rem' }}>(e, n)</div>
              <div style={muted}>Distributed openly. Used to encrypt.</div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Private key</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#14532d', fontSize: '0.875rem' }}>(d, n)</div>
              <div style={muted}>Kept secret. Used to decrypt.</div>
            </div>
          </div>
        </div>

        {/* Step 1: Key Generation */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span style={badge(primary)}>1</span>
            Key generation
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Step 1 — Pick two prime numbers p and q</div>
              <p style={muted}>
                Choose two distinct primes. The larger they are, the stronger the key.
                For illustration: p = 3, q = 7.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Step 2 — Compute the modulus n</div>
              <div style={mathBlock}>n = p × q</div>
              <p style={muted}>n is published as part of the public key. With p = 3, q = 7 we get n = 21.</p>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Step 3 — Compute Euler's totient φ(n) (read "phi of n")</div>
              <div style={mathBlock}>φ(n) = (p − 1) × (q − 1)</div>
              <p style={muted}>For p = 3, q = 7: φ(21) = 2 × 6 = 12. This value must stay secret — if someone knows φ(n), they can compute d.</p>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Step 4 — Pick the public exponent e</div>
              <p style={muted}>Choose e so that:</p>
              <ul style={{ ...muted, paddingLeft: '1.25rem', margin: '0.25rem 0' }}>
                <li>1 &lt; e &lt; φ(n)</li>
                <li>gcd(e, φ(n)) = 1 — that is, e and φ(n) are coprime</li>
                <li>e is usually picked as a prime number, since a prime is automatically coprime with φ(n) unless it divides it</li>
              </ul>
              <p style={muted}>Common choices are 3, 5, 7, 17, 257, and 65537. The standard in real systems is e = 65537. For our example: e = 5.</p>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Step 5 — Find the private exponent d</div>
              <div style={mathBlock}>d ≡ e⁻¹ (mod φ(n))  ↔  (d × e) mod φ(n) = 1</div>
              <p style={muted}>
                d is found with the extended Euclidean algorithm. With e = 5 and φ(n) = 12 the modular
                inverse is not unique: any value congruent to 5 modulo 12 works, such as 5, 17, or 29.
                We will use d = 17 to make the example less visually confusing (5 × 17 = 85, and 85 mod 12 = 1).
              </p>
            </div>

            <div style={{ background: primaryBg, border: `1px solid ${border}`, borderRadius: '0.5rem', padding: '1rem' }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Resulting keys</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'monospace', fontSize: '0.875rem', color: textColor }}>
                <div>Public key: <strong>(e, n) = (5, 21)</strong></div>
                <div>Private key: <strong>(d, n) = (17, 21)</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Encryption */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span style={badge('#2563eb')}>2</span>
            Encryption
          </h3>
          <p style={p}>
            Let M be the plaintext message expressed as a number. For this simple version, use a number
            M with 0 ≤ M &lt; n. The proof of correctness below assumes M is coprime with n.
            The ciphertext C is computed with:
          </p>
          <div style={mathBlock}>C = M<sup>e</sup> mod n</div>
          <p style={muted}>
            Toy example with the keys above (e = 5, n = 21). Pick M = 19.
            19⁵ = 2&thinsp;476&thinsp;099. 2&thinsp;476&thinsp;099 mod 21 = 10. So C = 10.
            With n = 21 we cannot fit normal ASCII codes — the interactive Encryption section
            uses larger keys so each letter fits.
          </p>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#1e40af' }}>
            <span style={{ fontWeight: 700 }}>Optimisation:</span> nobody computes M<sup>e</sup> in full.
            The square-and-multiply method takes the remainder mod n at every step,
            so the stored value stays below n and each multiplication stays below n².
          </div>
        </div>

        {/* Step 3: Decryption */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span style={badge('#16a34a')}>3</span>
            Decryption
          </h3>
          <p style={p}>
            The recipient uses the private key (d, n) to recover the original M:
          </p>
          <div style={mathBlock}>M = C<sup>d</sup> mod n</div>
          <p style={muted}>
            Example: C = 10 with the private key (d = 17, n = 21).
            10¹⁷ mod 21 = 19 = M. The message is recovered.
          </p>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#14532d' }}>
            <span style={{ fontWeight: 700 }}>Why it works (the math below explains why decryption reverses encryption — you do not need to memorise it):</span> by Euler's theorem M<sup>φ(n)</sup> ≡ 1 (mod n) when gcd(M, n) = 1.
            Because e·d ≡ 1 (mod φ(n)), we have M<sup>e·d</sup> = M<sup>1+k·φ(n)</sup> = M · (M<sup>φ(n)</sup>)<sup>k</sup> ≡ M (mod n).
          </div>
        </div>

        {/* Security */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>shield</span>
            Security of RSA
          </h3>
          <p style={p}>
            RSA's strength comes from the integer factorisation problem: knowing n = p·q,
            recovering p and q individually is computationally infeasible at large sizes.
            No publicly known classical method can factor a properly generated 2048-bit RSA modulus
            in practical time.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Common minimum today', value: '2048 bits', color: '#16a34a' },
              { label: 'Larger sizes for long-term security', value: '3072 or 4096 bits', color: '#2563eb' },
              { label: 'Legacy keys (insecure)', value: '< 1024 bits', color: '#dc2626' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--t-surface-alt)', borderRadius: '0.375rem', border: `1px solid ${border}` }}>
                <span style={{ fontSize: '0.8125rem', color: textColor }}>{item.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
          <p style={muted}>
            The teaching examples on this site use small numbers for clarity. Production systems
            (HTTPS, SSH, PGP) use RSA keys thousands of bits long.
          </p>
        </div>

        {/* Timeline */}
        <div style={card}>
          <h3 style={sectionTitle}>
            <span className="material-symbols-outlined" style={{ color: textMuted }}>history</span>
            History and applications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { year: '1977', text: 'RSA published by Rivest, Shamir, and Adleman at MIT.' },
              { year: '1983', text: 'MIT received a US patent for RSA (in force until 2000).' },
              { year: '2000', text: 'The patent expired; RSA became free to use worldwide.' },
              { year: 'Today', text: 'RSA is used in TLS/HTTPS, SSH, PGP, digital signatures, and PKI.' },
            ].map(item => (
              <div key={item.year} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '3.5rem', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: primary, paddingTop: '0.1rem' }}>{item.year}</div>
                <div style={{ ...muted, flex: 1 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
