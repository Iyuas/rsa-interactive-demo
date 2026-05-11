export default function Layout({ children, currentStep, setCurrentStep, darkMode, setDarkMode }) {
  const steps = [
    { id: 1, name: 'Key Generation', icon: 'key' },
    { id: 2, name: 'Encryption', icon: 'lock' },
    { id: 3, name: 'Decryption', icon: 'lock_open' },
  ];

  const t = darkMode ? {
    bg: '#0d1117',
    surface: '#161b22',
    surfaceAlt: '#1c2333',
    border: '#30363d',
    text: '#e6edf3',
    textMuted: '#8b949e',
    primary: '#58a6ff',
    primaryBg: '#1f3a5f',
    accent: '#3fb950',
    header: '#161b22',
    nav: '#161b22',
  } : {
    bg: '#f9f9ff',
    surface: '#ffffff',
    surfaceAlt: '#f1f3ff',
    border: '#c3c6d6',
    text: '#041b3c',
    textMuted: '#6b7280',
    primary: '#003d9b',
    primaryBg: '#e8eeff',
    accent: '#16a34a',
    header: '#ffffff',
    nav: '#f1f3ff',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, color: t.text, fontFamily: 'Inter, sans-serif', transition: 'background-color 0.3s, color 0.3s' }}>
      <header style={{
        backgroundColor: t.header,
        borderBottom: `1px solid ${t.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '3.5rem',
        padding: '0 1.5rem',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 50,
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="material-symbols-outlined" style={{ color: t.primary }}>terminal</span>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: 0, color: t.text, margin: 0 }}>RSA Scholar</h1>
        </div>
        <button
          onClick={() => setDarkMode((d) => !d)}
          title={darkMode ? 'Light theme' : 'Dark theme'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '999px',
            border: `1px solid ${t.border}`,
            backgroundColor: darkMode ? t.primaryBg : '#f3f4f6',
            color: t.text,
            cursor: 'pointer',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: 0,
            textTransform: 'uppercase',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
            {darkMode ? 'light_mode' : 'dark_mode'}
          </span>
          {darkMode ? 'Light' : 'Dark'}
        </button>
      </header>

      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: '3.5rem',
        height: 'calc(100vh - 3.5rem)',
        zIndex: 40,
        backgroundColor: t.nav,
        borderRight: `1px solid ${t.border}`,
        width: '16rem',
      }}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: t.primary, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '0.875rem' }}>RS</div>
            <div>
              <p style={{ color: t.primary, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0, margin: 0 }}>RSA Modules</p>
              <p style={{ color: t.textMuted, fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0, margin: 0 }}>Interactive Learning</p>
            </div>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: t.textMuted, marginBottom: '0.5rem', padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: 0 }}>Main Pipeline</p>
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    borderRight: isActive ? `2px solid ${t.primary}` : 'none',
                    backgroundColor: isActive ? t.primaryBg : 'transparent',
                    color: isActive ? t.primary : t.textMuted,
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '0.125rem',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>{step.icon}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0 }}>{step.name}</span>
                  {isDone && <span className="material-symbols-outlined" style={{ marginLeft: 'auto', fontSize: '0.875rem', color: t.accent }}>check_circle</span>}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '2.5rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: t.textMuted, marginBottom: '0.5rem', padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: 0 }}>Reference</p>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentStep(4); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', color: currentStep === 4 ? t.primary : t.textMuted, textDecoration: 'none', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0, backgroundColor: currentStep === 4 ? t.primaryBg : 'transparent', borderRight: currentStep === 4 ? `2px solid ${t.primary}` : 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>menu_book</span>
              Theory
            </a>
          </div>
        </div>
      </nav>

      <main style={{ marginLeft: '16rem', marginTop: '3.5rem', padding: '1.5rem', minHeight: 'calc(100vh - 3.5rem)', backgroundColor: t.bg }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <style>{`
            :root {
              --t-bg: ${t.bg};
              --t-surface: ${t.surface};
              --t-surface-alt: ${t.surfaceAlt};
              --t-border: ${t.border};
              --t-text: ${t.text};
              --t-text-muted: ${t.textMuted};
              --t-primary: ${t.primary};
              --t-primary-bg: ${t.primaryBg};
              --t-accent: ${t.accent};
            }
          `}</style>
          {children}
        </div>
      </main>
    </div>
  );
}
