export const PRESETS = {
  edu: {
    id: 'edu',
    label: 'Учебный',
    description: 'Маленькие простые, видны все шаги',
    p: 61n,
    q: 53n,
  },
  standard: {
    id: 'standard',
    label: 'Базовый',
    description: '4-значные простые, полный прогон',
    p: 1009n,
    q: 1013n,
  },
  real: {
    id: 'real',
    label: 'Реальный',
    description: '32-битные простые, разбивка на блоки',
    p: 2_147_483_647n,  // 2^31 - 1
    q: 2_147_483_629n,  // nearest prime below
  },
};

export const DEFAULT_PRESET_ID = 'edu';
