import { useState } from 'react';
import { PRESETS } from '../utils/presets';
import { isPrime } from '../utils/rsaMath';

export default function PresetPicker({ presetId, onApply }) {
  const [pInput, setPInput] = useState('');
  const [qInput, setQInput] = useState('');
  const [err, setErr] = useState(null);

  const applyPreset = (id) => {
    const p = PRESETS[id];
    onApply({ presetId: id, p: p.p, q: p.q });
    setErr(null);
  };

  const applyManual = () => {
    try {
      const p = BigInt(pInput);
      const q = BigInt(qInput);
      if (p === q) throw new Error('p and q must differ');
      if (!isPrime(p).isPrime) throw new Error(`p=${p} is not prime`);
      if (!isPrime(q).isPrime) throw new Error(`q=${q} is not prime`);
      onApply({ presetId: 'custom', p, q });
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {Object.values(PRESETS).map(p => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            className={`p-3 rounded-lg border text-left transition-all ${presetId === p.id ? 'border-[#003d9b] bg-[#f1f3ff]' : 'border-[#c3c6d6] hover:border-[#003d9b] hover:bg-gray-50'}`}
          >
            <div className="font-bold text-xs text-[#041b3c]">{p.label}</div>
            <div className="text-[10px] text-gray-500 mt-1">{p.description}</div>
            <div className="font-mono text-[10px] text-[#003d9b] mt-2">p={String(p.p)}</div>
            <div className="font-mono text-[10px] text-[#003d9b]">q={String(p.q)}</div>
          </button>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ручной ввод</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={pInput} onChange={e => setPInput(e.target.value)} placeholder="p (prime)"
            className="border border-[#c3c6d6] rounded p-2 font-mono text-sm" />
          <input value={qInput} onChange={e => setQInput(e.target.value)} placeholder="q (prime)"
            className="border border-[#c3c6d6] rounded p-2 font-mono text-sm" />
        </div>
        <button
          onClick={applyManual}
          disabled={!pInput || !qInput}
          className="mt-2 w-full py-2 bg-[#003d9b] text-white rounded font-bold text-xs disabled:bg-gray-300"
        >Проверить и применить</button>
        {err && <p className="text-xs text-red-600 mt-2 font-mono">{err}</p>}
      </div>
    </div>
  );
}
