import { useState } from 'react'
import Hero from './components/Hero.jsx'
import Downloader from './components/Downloader.jsx'
import FloatingOrbs from './components/FloatingOrbs.jsx'

export default function App() {
  const [started, setStarted] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  const theme = {
    '--bg': darkMode ? '#050510' : '#f0f4ff',
    '--text-primary': darkMode ? '#f1f5f9' : '#0f172a',
    '--text-secondary': darkMode ? '#94a3b8' : '#475569',
    '--text-muted': darkMode ? '#475569' : '#94a3b8',
    '--glass-bg': darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    '--glass-border': darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
    '--font-display': "'Syne', sans-serif",
    '--font-body': "'Inter', sans-serif",
    '--radius-xl': '24px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: darkMode
        ? 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 50%), #050510'
        : 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.06) 0%, transparent 50%), #f0f4ff',
      color: darkMode ? '#f1f5f9' : '#0f172a',
      transition: 'all 0.3s ease',
      ...theme,
    }}>

      {/* Theme toggle */}
      <button
        onClick={() => setDarkMode(d => !d)}
        style={{
          position: 'fixed',
          top: '1.2rem',
          right: '1.2rem',
          zIndex: 100,
          background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
          borderRadius: '100px',
          padding: '8px 16px',
          color: darkMode ? '#f1f5f9' : '#0f172a',
          cursor: 'pointer',
          fontSize: '13px',
          fontFamily: 'var(--font-body)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>

      <FloatingOrbs darkMode={darkMode} />

      {!started ? (
        <Hero onStart={() => setStarted(true)} darkMode={darkMode} />
      ) : (
        <Downloader onBack={() => setStarted(false)} darkMode={darkMode} />
      )}
    </div>
  )
}