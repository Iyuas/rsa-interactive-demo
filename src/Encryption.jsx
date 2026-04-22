import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function modPow(base, exponent, modulus) {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) result = (result * base) % modulus;
    exponent = exponent >> 1n;
    base = (base * base) % modulus;
  }
  return result;
}

export default function Encryption({ state, setState, nextStep }) {
  const [inputText, setInputText] = useState('HI');
  const [encryptStep, setEncryptStep] = useState(0); // 0: ready, 1: translating, 2: pow, 3: mod
  const [translatedM, setTranslatedM] = useState(null);

  // Simplified: convert char sum or single char block. For "HI" let's just do an integer
  // Actually let's just convert the string to hex and then BigInt, or a simple A=65 mapping.
  // For demo, "H"=72, "I"=73. 7273.
  const handleTranslate = () => {
    setEncryptStep(1);
    let numStr = '';
    for (let i = 0; i < inputText.length; i++) {
      numStr += inputText.charCodeAt(i).toString();
    }
    const m = parseInt(numStr.substring(0, 10)); // keep it somewhat bounded
    setTimeout(() => {
      setTranslatedM(m);
      setState(s => ({ ...s, m, originalText: inputText }));
      setEncryptStep(2);
    }, 800);
  };

  const handleEncrypt = () => {
    setEncryptStep(3);
    setTimeout(() => {
      const c = modPow(BigInt(state.m), BigInt(state.e), BigInt(state.n));
      setState(s => ({ ...s, c: Number(c) }));
      setEncryptStep(4);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <span className="text-[11px] font-bold text-[#003d9b] uppercase tracking-widest">Interactive Sandbox</span>
          <h1 className="text-3xl font-bold text-[#041b3c] mt-1">Step 2: Message Encryption</h1>
          <p className="text-gray-600 mt-2">Transform plaintext into a secure ciphertext using the recipient's public key.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2 flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#003d9b] uppercase tracking-tighter">Public Key (e, n)</span>
            <span className="font-mono text-blue-900 font-bold">({state.e || '?'}, {state.n || '?'})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#c3c6d6] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#041b3c]">Plaintext Input</h3>
              <span className="text-[10px] font-bold bg-[#d4e0f8] text-[#576377] px-2 py-0.5 rounded-full uppercase">ASCII Translation</span>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-500 block mb-2 font-semibold">Enter secret message (M)</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-[#f1f3ff] border border-[#c3c6d6] rounded-lg p-3 font-mono text-lg focus:border-[#003d9b] focus:ring-1 focus:ring-[#003d9b] outline-none" 
                  />
                  <button 
                    onClick={handleTranslate}
                    disabled={!state.n || encryptStep > 0}
                    className="bg-[#003d9b] text-white px-6 rounded-lg font-bold hover:bg-[#0052cc] disabled:bg-gray-300 transition-colors"
                  >
                    Translate
                  </button>
                </div>
              </div>
              
              {encryptStep >= 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 flex flex-col md:flex-row items-center gap-6 justify-center">
                  <div className="text-center">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Text</span>
                    <span className="text-2xl font-bold text-gray-700">{inputText}</span>
                  </div>
                  <span className="material-symbols-outlined text-blue-400 animate-pulse">arrow_forward</span>
                  <div className="text-center">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">Decimal (M)</span>
                    <span className="text-2xl font-mono font-bold text-[#003d9b]">
                      {translatedM !== null ? translatedM : <span className="animate-pulse">...</span>}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {encryptStep >= 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#c3c6d6] rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="text-lg font-bold">Visual Encryption Pipeline</h3>
                <button 
                  onClick={handleEncrypt}
                  disabled={encryptStep > 2}
                  className="bg-[#003d9b] text-white font-bold px-4 py-2 rounded shadow-md text-sm hover:scale-105 transition-all disabled:bg-gray-400"
                >
                  Start Machine
                </button>
              </div>
              
              <div className="relative min-h-[350px] bg-[#1d3052] overflow-hidden flex items-center justify-center">
                {/* Background math visual grid */}
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 10px 10px, white 1px, transparent 0)", backgroundSize: "40px 40px"}}></div>
                
                {/* Center Machine */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-56 h-56 border-2 border-blue-400/50 bg-blue-900/40 backdrop-blur-md rounded-full flex flex-col items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.2)]">
                  <div className="bg-blue-500/20 px-3 py-1 rounded-full mb-2">
                    <span className="text-[10px] uppercase font-bold text-blue-200 tracking-widest">Public Key Lock</span>
                  </div>
                  <span className="material-symbols-outlined text-blue-300 text-5xl mb-2">lock</span>
                  <div className="text-center">
                    <p className="text-white font-mono text-xs">Exponent: e = {state.e}</p>
                    <p className="text-white font-mono text-xs mt-1">Modulo: n = {state.n}</p>
                  </div>
                  {encryptStep === 3 && (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      className="absolute inset-[-4px] border-[3px] border-transparent border-t-blue-400 border-r-blue-400 rounded-full" 
                    />
                  )}
                  {encryptStep === 3 && (
                    <motion.div 
                      animate={{ rotate: -360 }} 
                      transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      className="absolute inset-[-12px] border-[1px] border-transparent border-b-blue-200 border-l-blue-200 rounded-full opacity-50" 
                    />
                  )}
                </div>

                {/* Input node (M) */}
                <AnimatePresence>
                  {encryptStep >= 2 && encryptStep <= 3 && (
                    <motion.div 
                      initial={{ left: "10%", opacity: 0, scale: 0.8 }}
                      animate={
                        encryptStep === 2 
                        ? { left: "15%", opacity: 1, scale: 1, y: "-50%" } 
                        : { left: "50%", opacity: 0, scale: 0.2, y: "-50%" }
                      }
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="absolute top-1/2 w-28 h-28 bg-white border border-[#c3c6d6] rounded-xl shadow-2xl flex flex-col justify-center items-center z-20"
                    >
                      <span className="text-[10px] uppercase font-bold text-gray-500">Message (M)</span>
                      <span className="text-3xl font-black text-[#041b3c] font-mono">{translatedM}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Path Track Base */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-blue-300/10 -translate-y-1/2 z-0" />
                <div className="absolute left-0 right-0 top-1/2 bg-blue-400/20 h-8 -translate-y-1/2 blur-lg -z-10" />

                {/* Processing Labels */}
                <AnimatePresence>
                  {encryptStep === 3 && (
                     <motion.div 
                       initial={{ opacity: 0, y: -20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0 }}
                       className="absolute top-10 left-1/2 -translate-x-1/2 text-blue-200 font-mono text-sm tracking-widest bg-blue-900/50 px-4 py-1 rounded"
                     >
                       Computing: ({translatedM} ^ {state.e}) mod {state.n} ...
                     </motion.div>
                  )}
                </AnimatePresence>

                {/* Output node (C) */}
                <AnimatePresence>
                  {encryptStep >= 4 && (
                    <motion.div
                      initial={{ left: "50%", opacity: 0, scale: 0.2, y: "-50%" }}
                      animate={{ left: "80%", opacity: 1, scale: 1, y: "-50%", rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="absolute top-1/2 -translate-x-1/2 w-28 h-28 bg-[#003d9b] text-white rounded-xl shadow-2xl flex flex-col justify-center items-center z-20 border-2 border-blue-300"
                    >
                     <span className="text-[10px] uppercase font-bold text-blue-200">Ciphertext (C)</span>
                     <span className="text-3xl font-black font-mono">{state.c}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          )}

          {encryptStep >= 4 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex justify-between items-center bg-white border border-[#c3c6d6] p-4 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500 max-w-sm">Encryption is complete. Proceed to decryption.</p>
                <button 
                  onClick={nextStep}
                  className="flex items-center gap-3 bg-[#003d9b] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#0052cc] transition-all"
                >
                  <span>Next Step: Decryption</span>
                  <span className="material-symbols-outlined">lock_open</span>
                </button>
             </motion.div>
          )}
        </div>

        {/* Info card */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-[#c3c6d6] rounded-xl p-6 flex flex-col h-max shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#041b3c]">How Encryption Works</h3>
            <span className="material-symbols-outlined text-[#003d9b] bg-blue-50 p-2 rounded-lg">school</span>
          </div>
          
          <div className="space-y-4">
            <div className={`p-3 rounded border-l-4 transition-all duration-500 shadow-sm ${encryptStep >= 1 ? 'bg-[#f1f3ff] border-[#003d9b] scale-105' : 'bg-gray-50 border-gray-300 grayscale opacity-50'}`}>
              <h4 className="text-sm font-bold text-[#041b3c]">1. Digitize</h4>
              <p className="text-xs text-gray-700 mt-1 font-medium">Computers only encrypt integers. We first map your text (e.g. ASCII) into a numeric block block (M).</p>
            </div>
            
            <div className={`p-3 rounded border-l-4 transition-all duration-500 shadow-sm ${encryptStep >= 2 ? 'bg-[#f1f3ff] border-[#003d9b] scale-105' : 'bg-gray-50 border-gray-300 grayscale opacity-50'}`}>
              <h4 className="text-sm font-bold text-[#041b3c]">2. Apply The Lock</h4>
              <p className="text-xs text-gray-700 mt-1 font-medium">We raise M to the power of the public key (e). This step exponentially scales and scrambles the data.</p>
            </div>

            <div className={`p-3 rounded border-l-4 transition-all duration-500 shadow-sm ${encryptStep >= 3 ? 'bg-[#f1f3ff] border-[#003d9b] scale-105' : 'bg-gray-50 border-gray-300 grayscale opacity-50'}`}>
              <h4 className="text-sm font-bold text-[#041b3c]">3. Wrap with Trapdoor</h4>
              <p className="text-xs text-gray-700 mt-1 font-medium">Using 'Modulo n' drops the massive number back into a bound. Dividing and taking the remainder is a 1-way function that stops hackers.</p>
            </div>
            
            <div className="bg-[#e8edff] rounded-lg p-4 flex items-center justify-center border border-[#b2c5ff] mt-4 shadow-inner">
               <span className="font-mono text-xl text-[#041b3c] font-black tracking-widest">C = M<sup className="text-[#003d9b]">e</sup> <span className="text-gray-500 font-normal opacity-50 mx-1">mod</span> n</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
