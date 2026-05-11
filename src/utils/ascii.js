// Plaintext <-> BigInt helpers. For teaching, this demo encrypts one ASCII
// character at a time instead of packing several characters into a block.

const CHAR_WIDTH = 3;

export function encodeBlocks(text, n) {
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code > 127) throw new Error(`Non-ASCII character "${ch}" (code ${code})`);
    if (BigInt(code) >= n) {
      throw new Error(`ASCII code ${code} for "${ch}" is not smaller than n (${n}). Choose larger prime numbers.`);
    }
  }

  return [...text].map((ch) => {
    const code = ch.charCodeAt(0);
    return {
      chars: [ch],
      codes: [code],
      digitStr: String(code).padStart(CHAR_WIDTH, '0'),
      value: BigInt(code),
    };
  });
}

export function decodeBlocks(blocks) {
  return blocks.map((b) => String.fromCharCode(Number(b.value))).join('');
}

export function decodeValue(value) {
  return String.fromCharCode(Number(value));
}
