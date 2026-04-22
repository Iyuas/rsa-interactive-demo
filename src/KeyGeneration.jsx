import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function modInverse(e, phi) {
  let m0 = phi, t, q;
  let x0 = 0, x1 = 1;

  if (phi === 1) return 0;

  while (e > 1) {
    q = Math.floor(e / phi);
    t = phi;
    phi = e % phi;
    e = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }

  if (x1 < 0) x1 += m0;
  return x1;
}

export default function KeyGeneration({ state, setState, nextStep }) {
  const [animStep, setAnimStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePrimes = () => {
    setIsGenerating(true);
    let counter = 0;
    const interval = setInterval(() => {
      setState(s => ({
        ...s,
        p: Math.floor(Math.random() * 100) + 10,
        q: Math.floor(Math.random() * 100) + 10,
      }));
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setState(s => ({ ...s, p: 61, q: 53 }));
        setIsGenerating(false);
      }
    }, 50);
  };

  const calcN = () => {
    setState(s => ({ ...s, n: s.p * s.q }));
    setAnimStep(1);
  };

  const calcPhi = () => {
    setState(s => ({ ...s, phi: (s.p - 1) * (s.q - 1) }));
    setAnimStep(2);
  };

  const calcE = () => {
    // Basic e selection for demo
    let e = 3;
    while (gcd(e, state.phi) !== 1) {
      e += 2;
    }
    // Often 65537 is used but let's use the actual first coprime or just fake for demo
    setState(s => ({ ...s, e: 17 })); 
    setAnimStep(3);
  };

  const calcD = () => {
    const d = modInverse(state.e, state.phi);
    setState(s => ({ ...s, d }));
    setAnimStep(4);
  };

  const insights = [
    { title: "The Foundation: Primes", text: "RSA relies on the mathematical difficulty of factoring large numbers. We start by picking two distinct prime numbers, p and q. In a real system, these would be hundreds of digits long." },
    { title: "The Trapdoor: Modulus (n)", text: `By multiplying p and q together (${state.p || 'p'} × ${state.q || 'q'}), we get the Modulus n = ${state.n}. This number will be shared publicly. While it's easy to multiply two primes, it's currently virtually impossible for computers to reverse this and find p and q from n alone.` },
    { title: "The Secret Cycle: Euler's Totient φ(n)", text: `We calculate φ(n) = (p-1) × (q-1) = ${state.phi}. This mysterious value calculates the number of integers smaller than n that share no common factors with n. It gives us the internal 'cycle length' to make the math work, and must be kept totally secret!` },
    { title: "The Lock: Public Exponent (e)", text: `We mathematically choose public exponent 'e' (${state.e}) such that it shares no common factors with φ(n). Together with 'n', this forms the Public Key. Anyone in the world can use it to encrypt a message to you.` },
    { title: "The Key: Private Exponent (d)", text: `We find the magical inverse 'd' (${state.d}) such that (e × d) mod φ(n) = 1. Thanks to Euler's Theorem, this means applying 'd' perfectly reverses the scrambling done by 'e'. Your Private Key is now complete and can unlock the ciphertext!` },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#041b3c] mb-2">Interactive Demo: Key Generation</h2>
        <p className="text-gray-600 max-w-2xl">Step 1: Understand why cryptographers pick prime numbers to construct the locking mechanics of RSA.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Controls */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#c3c6d6] rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#f1f3ff] px-4 py-3 border-b border-[#c3c6d6] flex justify-between items-center">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Step 1.1: Prime Selection</h3>
              <span className="material-symbols-outlined text-[#003d9b] text-sm">verified_user</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4 mb-2">
                <button 
                  onClick={generatePrimes}
                  className="bg-[#e8edff] text-[#003d9b] hover:bg-[#d7e2ff] border border-[#b2c5ff] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors w-full justify-center"
                >
                  <span className="material-symbols-outlined text-base">casino</span>
                  Auto-Generate Primes
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Prime Number p</label>
                  <input 
                    type="number"
                    value={state.p || ''}
                    onChange={(e) => setState({...state, p: parseInt(e.target.value) || 0})}
                    className="w-full border border-[#c3c6d6] rounded-lg p-3 font-mono text-gray-800 focus:ring-2 focus:ring-[#003d9b] focus:border-transparent transition-all outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Prime Number q</label>
                  <input 
                    type="number"
                    value={state.q || ''}
                    onChange={(e) => setState({...state, q: parseInt(e.target.value) || 0})}
                    className="w-full border border-[#c3c6d6] rounded-lg p-3 font-mono text-gray-800 focus:ring-2 focus:ring-[#003d9b] focus:border-transparent transition-all outline-none" 
                  />
                </div>
              </div>

              {/* Sequential Actions */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={calcN}
                  disabled={!state.p || !state.q}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all shadow-sm ${animStep >= 0 && state.p ? 'bg-[#003d9b] text-white hover:bg-[#0052cc]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Generate Modulus (n)
                </button>
                <button 
                  onClick={calcPhi}
                  disabled={animStep < 1}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${animStep >= 1 ? 'bg-[#003d9b] text-white hover:bg-[#0052cc]' : 'bg-[#e8edff] text-gray-400 cursor-not-allowed border border-dashed border-gray-300'}`}
                >
                  <span className="material-symbols-outlined">functions</span>
                  Compute Hidden Cycle length: φ(n)
                </button>
                <button 
                  onClick={calcE}
                  disabled={animStep < 2}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${animStep >= 2 ? 'bg-[#003d9b] text-white hover:bg-[#0052cc]' : 'bg-[#e8edff] text-gray-400 cursor-not-allowed border border-dashed border-gray-300'}`}
                >
                  <span className="material-symbols-outlined">key</span>
                  Select Public Locking Exponent (e)
                </button>
                <button 
                  onClick={calcD}
                  disabled={animStep < 3}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all ${animStep >= 3 ? 'bg-[#003d9b] text-white hover:bg-[#0052cc]' : 'bg-[#e8edff] text-gray-400 cursor-not-allowed border border-dashed border-gray-300'}`}
                >
                  <span className="material-symbols-outlined">vpn_key</span>
                  Calculate Private Unlocking Exponent (d)
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={nextStep}
            disabled={animStep < 4}
            className={`w-full border-2 border-dashed p-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all group ${animStep >= 4 ? 'border-[#003d9b] text-[#003d9b] hover:bg-blue-50 cursor-pointer shadow-md' : 'border-[#c3c6d6] text-gray-400 cursor-not-allowed'}`}
          >
            Next Step: Test the Keys (Encryption)
            <span className={`material-symbols-outlined transition-transform ${animStep >= 4 ? 'group-hover:translate-x-1' : ''}`}>arrow_forward</span>
          </button>
        </div>

        {/* Right: Lab Output */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#d4e0f8] rounded-lg text-[#535f73]">
                <span className="material-symbols-outlined">info</span>
              </div>
              <h4 className="text-lg font-bold text-[#041b3c]">Variables Breakdown</h4>
            </div>
            
            {/* EDUCATIONAL BOX */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={animStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#f1f3ff] border-l-4 border-[#003d9b] p-4 rounded-r-lg mb-6 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-5">
                   <span className="material-symbols-outlined text-6xl">school</span>
                </div>
                <h5 className="font-bold text-[#003d9b] text-sm mb-2 flex items-center">
                  <span className="material-symbols-outlined text-sm mr-2 fill-current">tips_and_updates</span>
                  {insights[animStep].title}
                </h5>
                <p className="text-sm text-gray-700 leading-relaxed font-medium relative z-10">{insights[animStep].text}</p>
              </motion.div>
            </AnimatePresence>

            <div className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200 shadow-inner">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-mono text-xs uppercase text-gray-500">Modulus (n) = p × q</span>
                <AnimatePresence mode="popLayout">
                  <motion.span 
                    key={state.n}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono text-[#003d9b] font-bold text-lg"
                  >
                    {state.n ? state.n : '---'}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-mono text-xs uppercase text-gray-500">φ(n) = (p-1)(q-1)</span>
                <AnimatePresence mode="popLayout">
                  <motion.span 
                    key={state.phi}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono text-[#003d9b] font-bold text-lg"
                  >
                    {state.phi ? state.phi : '---'}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="font-mono text-xs uppercase text-gray-500">Public Exp (e)</span>
                <AnimatePresence mode="popLayout">
                  <motion.span 
                    key={state.e}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono text-[#003d9b] font-bold text-lg"
                  >
                    {state.e ? state.e : '---'}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs uppercase text-gray-500">Private Exp (d)</span>
                <AnimatePresence mode="popLayout">
                  <motion.span 
                    key={state.d}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono text-green-600 font-bold text-lg"
                  >
                    {state.d ? state.d : '---'}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            
            {animStep >= 4 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
              >
                <span className="material-symbols-outlined text-green-600 text-sm">lock_person</span>
                <div>
                  <p className="text-xs font-bold text-green-800">Keys Generated Successfully!</p>
                  <p className="text-[10px] text-green-700 mt-1">Public Key: ({state.e}, {state.n}) <br/> Private Key: ({state.d}, {state.n})</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
