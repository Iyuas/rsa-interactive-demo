import { useState } from 'react';

export default function Layout({ children, currentStep, setCurrentStep }) {
  const steps = [
    { id: 1, name: 'Key Generation', icon: 'key' },
    { id: 2, name: 'Encryption', icon: 'lock' },
    { id: 3, name: 'Decryption', icon: 'lock_open' },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#041b3c] font-sans">
      {/* TopAppBar Shell */}
      <header className="bg-white border-b border-[#c3c6d6] flex justify-between items-center h-14 px-6 w-full fixed top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#003d9b]">terminal</span>
          <h1 className="text-lg font-bold tracking-tighter text-[#041b3c]">RSA Scholar</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center hidden md:flex">
            <span className="material-symbols-outlined absolute left-3 text-gray-400 text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search modules..." 
              className="bg-gray-50 border border-[#c3c6d6] rounded-lg pl-9 pr-4 py-1.5 text-xs w-64 focus:ring-1 focus:ring-[#003d9b] outline-none" 
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-50 rounded-lg"><span className="material-symbols-outlined text-gray-600">help</span></button>
            <button className="p-2 hover:bg-gray-50 rounded-lg"><span className="material-symbols-outlined text-gray-600">settings</span></button>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-300 border border-gray-200"></div>
        </div>
      </header>

      {/* SideNavBar Shell */}
      <nav className="flex flex-col fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-40 bg-[#f1f3ff] border-r border-[#c3c6d6] w-64">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#003d9b] rounded-lg flex items-center justify-center text-white font-black">RS</div>
            <div>
              <p className="text-[#003d9b] font-black text-xs uppercase tracking-wider">RSA Modules</p>
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest">Precision Learning</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-gray-400 mb-2 px-3 uppercase tracking-widest">Main Pipeline</p>
            {steps.map(step => (
              <button 
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${currentStep === step.id ? 'bg-blue-50 text-[#003d9b] border-r-2 border-[#003d9b]' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <span className="material-symbols-outlined text-lg">{step.icon}</span>
                <span className="text-xs font-medium uppercase tracking-wider">{step.name}</span>
                {currentStep > step.id && <span className="ml-auto material-symbols-outlined text-sm text-green-500">check_circle</span>}
              </button>
            ))}
          </div>
          <div className="mt-10 space-y-1">
            <p className="text-[11px] font-bold text-gray-400 mb-2 px-3 uppercase tracking-widest">Reference</p>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
              <span className="material-symbols-outlined text-lg">menu_book</span>
              <span className="text-xs font-medium uppercase tracking-wider">Theory</span>
            </a>
          </div>
        </div>
        <div className="mt-auto p-6 border-t border-[#c3c6d6]">
          <div className="w-full bg-[#0052cc] text-white py-2.5 rounded text-xs font-bold uppercase tracking-widest text-center shadow-md">
              Progress: {Math.round((currentStep / 3) * 100)}%
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="ml-64 mt-14 p-6 min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
        {/* Background blobs */}
        <div className="fixed top-20 right-10 w-96 h-96 bg-blue-400/5 blur-[120px] -z-10 rounded-full"></div>
        <div className="fixed bottom-10 left-80 w-64 h-64 bg-gray-400/5 blur-[100px] -z-10 rounded-full"></div>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-[#003d9b] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>
      </div>
    </div>
  );
}
