import { describe, it, expect } from 'vitest';
import { encodeBlocks, decodeBlocks } from './ascii.js';

describe('encodeBlocks', () => {
  it('round-trips "HI" through n=3233', () => {
    const blocks = encodeBlocks('HI', 3233n);
    expect(blocks.every(b => b.value < 3233n)).toBe(true);
    expect(decodeBlocks(blocks)).toBe('HI');
  });

  it('splits into one char per block when n <= 65535', () => {
    const blocks = encodeBlocks('HI', 3233n);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].chars).toEqual(['H']);
    expect(blocks[0].codes).toEqual([72]);
    expect(blocks[0].value).toBe(72n);
  });

  it('packs multi-char blocks when n is large', () => {
    const blocks = encodeBlocks('HELLO', 10n ** 20n);
    expect(blocks.length).toBeLessThan(5);
    expect(decodeBlocks(blocks)).toBe('HELLO');
  });

  it('rejects characters with code > 255', () => {
    expect(() => encodeBlocks('é', 3233n)).toThrow(/ASCII/);
  });
});
