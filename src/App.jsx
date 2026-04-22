import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './Layout';
import KeyGeneration from './KeyGeneration';
import Encryption from './Encryption';
import Decryption from './Decryption';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cryptoState, setCryptoState] = useState({
    p: null,
    q: null,
    n: null,
    phi: null,
    e: null,
    d: null,
    m: null, // message int
    c: null  // ciphertext int
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <Layout currentStep={currentStep} setCurrentStep={setCurrentStep}>
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <KeyGeneration 
            key="step1" 
            state={cryptoState} 
            setState={setCryptoState}
            nextStep={nextStep}
          />
        )}
        {currentStep === 2 && (
          <Encryption 
            key="step2" 
            state={cryptoState} 
            setState={setCryptoState}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {currentStep === 3 && (
          <Decryption 
            key="step3" 
            state={cryptoState} 
            setState={setCryptoState}
            prevStep={prevStep}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
