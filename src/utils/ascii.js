// Plaintext ↔ BigInt block helpers. Each character is encoded as a 3-digit
// decimal ASCII code (000–127) so decoding is unambiguous. Blocks are packed
// greedily to fit within n (the RSA modulus), so every block value is strictly
// less than n and can round-trip through modPow.

const CHAR_WIDTH = 3;

export function encodeBlocks(text, n) {
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code > 127) throw new Error(`Non-ASCII character "${ch}" (code ${code})`);
  }

  const nStr = n.toString();
  const maxChars = Math.max(1, Math.floor((nStr.length - 1) / CHAR_WIDTH));

  const blocks = [];
  for (let i = 0; i < text.length; i += maxChars) {
    const slice = text.slice(i, i + maxChars);
    const chars = [...slice];
    const codes = chars.map(c => c.charCodeAt(0));
    const digitStr = codes.map(c => String(c).padStart(CHAR_WIDTH, '0')).join('');
    const value = BigInt(digitStr);
    if (value >= n) {
      throw new Error(`Block value ${value} >= n (${n}); pick larger primes.`);
    }
    blocks.push({ chars, codes, digitStr, value });
  }
  return blocks;
}

export function decodeBlocks(blocks) {
  let out = '';
  for (const b of blocks) {
    const digits = b.value.toString().padStart(b.chars.length * CHAR_WIDTH, '0');
    for (let i = 0; i < digits.length; i += CHAR_WIDTH) {
      out += String.fromCharCode(parseInt(digits.slice(i, i + CHAR_WIDTH), 10));
    }
  }
  return out;
}

export function decodeValue(value, charCount) {
  const digits = value.toString().padStart(charCount * CHAR_WIDTH, '0');
  let out = '';
  for (let i = 0; i < digits.length; i += CHAR_WIDTH) {
    out += String.fromCharCode(parseInt(digits.slice(i, i + CHAR_WIDTH), 10));
  }
  return out;
}
