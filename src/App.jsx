import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './Layout';
import KeyGeneration from './KeyGeneration';
import Encryption from './Encryption';
import Decryption from './Decryption';
import Theory from './Theory';
import { PRESETS, DEFAULT_PRESET_ID } from './utils/presets';

const initialPreset = PRESETS[DEFAULT_PRESET_ID];

const initialState = {
  presetId: initialPreset.id,
  p: null,
  q: null,
  n: null,
  phi: null,
  e: null,
  d: null,
  plaintext: '',
  blocks: [],
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cryptoState, setCryptoState] = useState(initialState);
  const [darkMode, setDarkMode] = useState(false);

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, 3));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Layout currentStep={currentStep} setCurrentStep={setCurrentStep} darkMode={darkMode} setDarkMode={setDarkMode}>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <KeyGeneration key="step1" state={cryptoState} setState={setCryptoState} nextStep={nextStep} />
          )}
          {currentStep === 2 && (
            <Encryption key="step2" state={cryptoState} setState={setCryptoState} nextStep={nextStep} prevStep={prevStep} />
          )}
          {currentStep === 3 && (
            <Decryption key="step3" state={cryptoState} setState={setCryptoState} prevStep={prevStep} />
          )}
          {currentStep === 4 && (
            <Theory key="step4" />
          )}
        </AnimatePresence>
      </Layout>
    </div>
  );
}
