import { useState, useEffect } from 'react'

const PLATFORMS = [
  { name: 'YouTube', color: '#ff0000', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )},
  { name: 'Instagram', color: '#e1306c', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  )},
  { name: 'Twitter / X', color: '#1d9bf0', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  )},
  { name: 'Pinterest', color: '#e60023', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  )},
]

const FUNNY_LINES = [
  "no cap, we downloading everything 💀",
  "your wifi better not fumble rn",
  "we not judging what u saving lol",
]

export default function Hero({ onStart, darkMode }) {
  const [lineIdx, setLineIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setLineIdx(i => (i + 1) % FUNNY_LINES.length)
        setVisible(true)
      }, 400)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      gap: '1.5rem',
    }}>

      {/* Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(124,58,237,0.12)',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '100px',
        padding: '5px 14px',
        fontSize: '12px',
        color: 'rgba(167,139,250,0.9)',
        fontFamily: 'var(--font-body)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        <span style={{ fontSize: '10px' }}>⚡</span>
        free · no watermark · no bs
      </div>

      {/* Main heading */}
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.04em',
          margin: '0 0 0.6rem 0',
          color: darkMode ? '#ffffff' : '#0f172a',
        }}>
          YO OG'S
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '1rem',
          color: darkMode ? 'rgba(148,163,184,0.8)' : 'rgba(15,23,42,0.7)',
          margin: 0,
          fontWeight: 400,
        }}>
          what are we stealing from the internet today? (shhh)
        </p>
      </div>

      {/* Rotating funny subtitle */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
        color: darkMode ? 'rgba(100,116,139,0.9)' : 'rgba(71,85,105,0.8)',
        margin: 0,
        height: '1.5rem',
        transition: 'opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}>
        {FUNNY_LINES[lineIdx]}
      </p>

      {/* Platform pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        maxWidth: '420px',
      }}>
        {PLATFORMS.map((p, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '100px',
            background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
            border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)',
            fontSize: '13px',
            color: darkMode ? 'rgba(148,163,184,0.8)' : 'rgba(30,41,59,0.8)',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.2s ease',
            cursor: 'default',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${p.color}20`
            e.currentTarget.style.borderColor = `${p.color}50`
            e.currentTarget.style.color = p.color
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'
            e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
            e.currentTarget.style.color = darkMode ? 'rgba(148,163,184,0.8)' : 'rgba(30,41,59,0.8)'
          }}
          >
            <span style={{ color: p.color, display: 'flex', alignItems: 'center' }}>{p.icon}</span>
            {p.name}
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={onStart}
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          border: '1px solid rgba(124,58,237,0.5)',
          borderRadius: '14px',
          padding: '14px 40px',
          color: 'white',
          fontFamily: 'var(--font-display)',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.02em',
          boxShadow: '0 0 30px rgba(124,58,237,0.35)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 0 50px rgba(124,58,237,0.55)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.35)'
        }}
      >
        Start Downloading →
      </button>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        paddingBottom: '1rem',
      }}>
        {[
          { val: '4K', label: 'Quality' },
          { val: '4', label: 'Platforms' },
          { val: 'MP3', label: 'Audio' },
          { val: '✂️', label: 'Trim' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #a78bfa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{s.val}</div>
            <div style={{
              fontSize: '11px',
              color: darkMode ? 'rgba(100,116,139,0.8)' : 'rgba(71,85,105,0.8)',
              fontFamily: 'var(--font-body)',
              marginTop: '2px',
            }}>{s.label}</div>
          </div>
        ))}
      </div>

    </div>
  )
}