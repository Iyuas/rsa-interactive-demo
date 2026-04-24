export const PRESETS = {
  edu: {
    id: 'edu',
    label: 'Edu',
    description: 'Small primes, readable traces',
    p: 61n,
    q: 53n,
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    description: '4-digit primes, full demo',
    p: 1009n,
    q: 1013n,
  },
  real: {
    id: 'real',
    label: 'Real',
    description: '~32-bit primes, block-level messages',
    p: 2_147_483_647n,  // 2^31 - 1
    q: 2_147_483_629n,  // nearest prime below
  },
};

export const DEFAULT_PRESET_ID = 'edu';
