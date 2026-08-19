import { useState, useRef } from 'react'
import axios from 'axios'

const API = '/api'

function detectPlatform(url) {
  if (!url) return null
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('pinterest.com') || url.includes('pin.it')) return 'pinterest'
  return 'unknown'
}

const PLATFORM_META = {
  youtube:   { emoji: '▶️', color: '#ff4444', name: 'YouTube' },
  instagram: { emoji: '📸', color: '#e1306c', name: 'Instagram' },
  twitter:   { emoji: '🐦', color: '#1da1f2', name: 'Twitter/X' },
  pinterest: { emoji: '📌', color: '#bd081c', name: 'Pinterest' },
  unknown:   { emoji: '🔗', color: '#7c3aed', name: 'Video' },
}

const FUNNY_PROGRESS = [
  (p) => `bribing youtube servers... ${p}%`,
  (p) => `sneaking past the algorithm... ${p}%`,
  (p) => `downloading at light speed... ${p}%`,
  (p) => `convincing the pixels to move... ${p}%`,
  (p) => `stealing from the internet... ${p}%`,
  (p) => `your wifi is sweating rn... ${p}%`,
]

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'white', display: 'inline-block',
          animation: `bounce-dots 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </span>
  )
}

function VideoPlayer({ filename, duration, onTrim, darkMode }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(duration)
  const [trimming, setTrimming] = useState(false)
  const [showTrim, setShowTrim] = useState(false)

  function formatTime(s) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    return `${m}:${String(sec).padStart(2,'0')}`
  }

  function toHMS(s) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  function togglePlay() {
    if (!videoRef.current) return
    if (playing) { videoRef.current.pause() } else { videoRef.current.play() }
    setPlaying(!playing)
  }

  function handleTimeUpdate() {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
  }

  function handleSeek(e) {
    const val = Number(e.target.value)
    setCurrentTime(val)
    if (videoRef.current) videoRef.current.currentTime = val
  }

  async function handleTrim() {
    setTrimming(true)
    try { await onTrim(toHMS(trimStart), toHMS(trimEnd)) }
    finally { setTrimming(false) }
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ borderRadius: 14, overflow: 'hidden', background: '#000', position: 'relative', marginBottom: '1rem' }}>
        <video
          ref={videoRef}
          src={`${API}/preview/${filename}`}
          style={{ width: '100%', maxHeight: 300, display: 'block' }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setPlaying(false)}
        />
        <div onClick={togglePlay} style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          background: playing ? 'transparent' : 'rgba(0,0,0,0.3)',
          transition: 'background 0.2s',
        }}>
          {!playing && (
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(124,58,237,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', color: 'white',
            }}>▶</div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <input type="range" min={0} max={duration} value={currentTime}
          onChange={handleSeek} style={{ width: '100%', accentColor: '#7c3aed' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <button onClick={() => setShowTrim(!showTrim)} style={{
        width: '100%',
        background: showTrim ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
        border: showTrim ? '1px solid rgba(6,182,212,0.4)' : '1px solid var(--glass-border)',
        borderRadius: 12, padding: '10px',
        color: showTrim ? '#67e8f9' : 'var(--text-secondary)',
        cursor: 'pointer', fontFamily: 'var(--font-body)',
        fontSize: '13px', fontWeight: 500, transition: 'all 0.2s ease',
        marginBottom: showTrim ? '1rem' : 0,
      }}>
        {'✂️'} {showTrim ? 'Hide Trim' : 'Trim Video'}
      </button>

      {showTrim && (
        <div style={{
          background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          borderRadius: 14, padding: '1rem',
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>START</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#7c3aed', fontWeight: 700, marginBottom: '6px' }}>{formatTime(trimStart)}</div>
              <input type="range" min={0} max={duration - 1} value={trimStart}
                onChange={e => setTrimStart(Math.min(Number(e.target.value), trimEnd - 1))}
                style={{ width: '100%', accentColor: '#7c3aed', marginBottom: '6px' }} />
              <button onClick={() => setTrimStart(Math.floor(currentTime))} style={{
                width: '100%', background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '6px',
                color: '#a78bfa', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '11px',
              }}>Set to current ↑</button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>END</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#06b6d4', fontWeight: 700, marginBottom: '6px' }}>{formatTime(trimEnd)}</div>
              <input type="range" min={1} max={duration} value={trimEnd}
                onChange={e => setTrimEnd(Math.max(Number(e.target.value), trimStart + 1))}
                style={{ width: '100%', accentColor: '#06b6d4', marginBottom: '6px' }} />
              <button onClick={() => setTrimEnd(Math.ceil(currentTime))} style={{
                width: '100%', background: 'rgba(6,182,212,0.15)',
                border: '1px solid rgba(6,182,212,0.3)', borderRadius: 8, padding: '6px',
                color: '#67e8f9', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '11px',
              }}>Set to current ↑</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '1rem' }}>
            <span>Clip: <strong style={{ color: 'var(--text-primary)' }}>{formatTime(trimEnd - trimStart)}</strong></span>
            <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{formatTime(duration)}</strong></span>
          </div>

          <button onClick={handleTrim} disabled={trimming} style={{
            width: '100%',
            background: trimming ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            border: 'none', borderRadius: 12, padding: '12px', color: 'white',
            fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700,
            cursor: trimming ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
          }}>
            {trimming ? <LoadingDots /> : '✂️ Trim & Download'}
          </button>
        </div>
      )}
    </div>
  )
}

function HistoryPanel({ history, onClear, darkMode }) {
  if (history.length === 0) return null
  return (
    <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem', width: '100%', maxWidth: 640, marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{'🕓'} Recent Downloads</div>
        <button onClick={onClear} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-body)',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >clear all</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: 10, border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          }}>
            {item.thumbnail ? (
              <img src={item.thumbnail} alt="" style={{ width: 48, height: 27, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 48, height: 27, borderRadius: 6, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                {PLATFORM_META[item.platform]?.emoji || '🔗'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>{item.quality} · {item.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Downloader({ onBack, darkMode }) {
  const [url, setUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [funnyMsgIdx] = useState(() => Math.floor(Math.random() * FUNNY_PROGRESS.length))
  const [error, setError] = useState('')
  const [lastFilename, setLastFilename] = useState(null)
  const [serverFilename, setServerFilename] = useState(null)
  const [success, setSuccess] = useState(false)
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('snapload_history') || '[]') }
    catch { return [] }
  })

  const platform = detectPlatform(url)
  const meta = platform ? PLATFORM_META[platform] : null
  const isYT = platform === 'youtube'

  function addToHistory(info, quality) {
    const entry = {
      title: info.title || 'Unknown',
      thumbnail: info.thumbnail || null,
      platform: detectPlatform(url) || 'unknown',
      quality, date: new Date().toLocaleDateString(),
    }
    const updated = [entry, ...history].slice(0, 5)
    setHistory(updated)
    localStorage.setItem('snapload_history', JSON.stringify(updated))
  }

  async function handleFetch() {
    if (!url.trim()) return
    setLoading(true); setError(''); setVideoInfo(null); setSuccess(false); setLastFilename(null); setServerFilename(null)
    try {
      const { data } = await axios.get(`${API}/info`, { params: { url } })
      setVideoInfo(data)
      setSelectedFormat(data.formats[0]?.value || 'best')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not fetch video info. Check the link.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
  setDownloading(true); setError(''); setDownloadProgress(0)

  try {
    // Step 1: Start the job
    const { data } = await axios.post(`${API}/download`, {
      url, quality: selectedFormat
    })

    const jobId = data.job_id
    const fileId = data.file_id

    // Step 2: Poll progress via SSE
    await new Promise((resolve, reject) => {
      const es = new EventSource(`${API}/progress/${jobId}`)
      window._snaploadSSE = es

      es.onmessage = (ev) => {
        const d = JSON.parse(ev.data)

        if (d.status === 'downloading' || d.status === 'processing') {
          setDownloadProgress(d.percent)
        }

        if (d.status === 'done') {
          setDownloadProgress(100)
          es.close()
          window._snaploadSSE = null
          resolve()
        }

        if (d.status === 'error') {
          es.close()
          window._snaploadSSE = null
          reject(new Error('Download failed on server.'))
        }
      }

      es.onerror = () => {
        es.close()
        window._snaploadSSE = null
        reject(new Error('Connection lost.'))
      }
    })

    // Step 3: Fetch the actual file
    const response = await axios.get(`${API}/file/${jobId}`, {
      responseType: 'blob',
      timeout: 120000,
      onDownloadProgress: (e) => {
        if (e.total) {
          setDownloadProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
    })

    const headers = response.headers
    const disposition = headers['content-disposition'] || ''
    const ext = selectedFormat === 'audio' ? 'mp3' : 'mp4'
    let filename = `video.${ext}`
    const match = disposition.match(/filename="?([^";\n]+)"?/)
    if (match) filename = decodeURIComponent(match[1].trim())

    const sf = headers['x-server-filename']
    if (sf) setServerFilename(sf)

    const blobUrl = window.URL.createObjectURL(new Blob([response.data], {
      type: ext === 'mp3' ? 'audio/mpeg' : 'video/mp4'
    }))
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(blobUrl)

    setLastFilename(filename)
    setSuccess(true)
    setDownloadProgress(100)
    if (videoInfo) addToHistory(videoInfo, selectedFormat)

  } catch (err) {
    if (window._snaploadSSE) {
      window._snaploadSSE.close()
      window._snaploadSSE = null
    }
    setError(err.response?.data?.detail || err.message || 'Download failed. Try again.')
  } finally {
    setDownloading(false)
  }
}

  async function handleTrim(start, end) {
    const trimFile = serverFilename || lastFilename
    if (!trimFile) { setError('Download the video first.'); return }
    try {
      const response = await axios.post(`${API}/trim`, {
        filename: trimFile, start, end
      }, { responseType: 'blob', timeout: 60000 })

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `trimmed_${lastFilename}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Trim failed.')
    }
  }

  function handleReset() {
    setUrl(''); setVideoInfo(null); setSelectedFormat('')
    setError(''); setSuccess(false); setLastFilename(null); setServerFilename(null); setDownloadProgress(0)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '2rem 1rem', paddingTop: '5rem',
      position: 'relative', zIndex: 1,
    }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <button onClick={onBack} style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))',
          border: '1px solid rgba(124,58,237,0.4)',
          borderRadius: 10,
          padding: '8px 18px',
          color: '#a78bfa',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))'
            e.currentTarget.style.color = '#a78bfa'
          }}
        >{'← back'}</button>

        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{'OG Downloader ⚡'}</div>

        <div style={{ width: 80 }} />
      </div>

      {/* Main card */}
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: 640 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>{'paste the link 🔗'}</h2>
        <p style={{ fontSize: '13px', marginBottom: '1.5rem', fontFamily: 'var(--font-body)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'YouTube', color: '#ff4444' },
            { label: 'Instagram', color: '#e1306c' },
            { label: 'Twitter/X', color: '#1da1f2' },
            { label: 'Pinterest', color: '#bd081c' },
          ].map((p, i) => (
            <span key={i} style={{
              color: p.color,
              background: p.color + '18',
              border: `1px solid ${p.color}40`,
              borderRadius: '100px',
              padding: '2px 10px',
              fontSize: '11px',
              fontWeight: 600,
            }}>{p.label}</span>
          ))}
        </p>

        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          {meta && (
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', zIndex: 2 }}>
              {meta.emoji}
            </span>
          )}
          <input
            value={url}
            onChange={e => { setUrl(e.target.value); setVideoInfo(null); setError(''); setSuccess(false) }}
            onKeyDown={e => e.key === 'Enter' && handleFetch()}
            placeholder="https://youtube.com/watch?v=..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${meta ? meta.color + '50' : 'var(--glass-border)'}`,
              borderRadius: 14, padding: `14px 80px 14px ${meta ? '44px' : '16px'}`,
              color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              fontSize: '14px', outline: 'none', transition: 'border-color 0.2s ease',
            }}
            onFocus={e => e.target.style.borderColor = '#7c3aed'}
            onBlur={e => e.target.style.borderColor = meta ? meta.color + '50' : 'var(--glass-border)'}
          />
          {url && (
            <button onClick={handleFetch} disabled={loading} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', border: 'none',
              borderRadius: 10, padding: '8px 16px', color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700,
              opacity: loading ? 0.6 : 1, transition: 'all 0.2s ease',
            }}>
              {loading ? <LoadingDots /> : 'GO'}
            </button>
          )}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '12px 16px', color: '#fca5a5',
            fontSize: '13px', marginBottom: '1rem', fontFamily: 'var(--font-body)',
          }}>{'⚠️'} {error}</div>
        )}
      </div>

      {/* Video info */}
      {videoInfo && (
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem', width: '100%', maxWidth: 640, marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            {videoInfo.thumbnail && (
              <img src={videoInfo.thumbnail} alt="thumbnail" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 10, flexShrink: 0, border: '1px solid var(--glass-border)' }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {videoInfo.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                {videoInfo.uploader && <span>@{videoInfo.uploader} · </span>}
                {videoInfo.duration ? `${Math.floor(videoInfo.duration / 60)}m ${videoInfo.duration % 60}s` : ''}
              </div>
               {videoInfo.formats.some(f => f.value === '4k') && (
               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', color: '#a78bfa', marginTop: '6px' }}>
               {'⭐ 4K supported'}
                </div>
               )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', fontFamily: 'var(--font-body)' }}>SELECT QUALITY</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {videoInfo.formats.map(fmt => (
                <button key={fmt.value} onClick={() => setSelectedFormat(fmt.value)} style={{
                  background: selectedFormat === fmt.value ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'rgba(255,255,255,0.04)',
                  border: selectedFormat === fmt.value ? '1px solid transparent' : '1px solid var(--glass-border)',
                  borderRadius: 10, padding: '8px 16px',
                  color: selectedFormat === fmt.value ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px',
                  fontWeight: selectedFormat === fmt.value ? 600 : 400, transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {fmt.value === 'audio' && '🎵 '}
                  {fmt.value === '4k' && '✨ '}
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download button + progress */}
          <button onClick={handleDownload} disabled={downloading} style={{
            width: '100%',
            background: downloading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            border: 'none', borderRadius: 14, padding: '15px', color: 'white',
            fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
            cursor: downloading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
            boxShadow: downloading ? 'none' : '0 4px 24px rgba(124,58,237,0.4)',
            marginBottom: '0.5rem', position: 'relative', overflow: 'hidden',
          }}
            onMouseEnter={e => { if (!downloading) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = '' }}
          >
            {downloading && (
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${downloadProgress}%`,
                background: 'rgba(255,255,255,0.15)',
                transition: 'width 0.3s ease',
              }} />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {downloading
                ? FUNNY_PROGRESS[funnyMsgIdx](downloadProgress)
                : '⬇️ Download Now'}
            </span>
          </button>

          {/* Success + Video Player */}
          {success && lastFilename && selectedFormat !== 'audio' && videoInfo.duration && serverFilename && (
            <div>
              <div style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 12, padding: '12px 16px', color: '#86efac',
                fontSize: '13px', marginTop: '0.5rem', textAlign: 'center', fontFamily: 'var(--font-body)',
              }}>{'✅ downloaded! preview & trim below 👇'}</div>

              <VideoPlayer
                filename={serverFilename}
                duration={videoInfo.duration}
                onTrim={handleTrim}
                darkMode={darkMode}
              />

              <button onClick={handleReset} style={{
                width: '100%', marginTop: '1rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                borderRadius: 12, padding: '12px', color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px',
                fontWeight: 500, transition: 'all 0.2s ease',
              }}>+ New Download</button>
            </div>
          )}

          {success && (selectedFormat === 'audio' || !videoInfo.duration) && (
            <div>
              <div style={{
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 12, padding: '12px 16px', color: '#86efac',
                fontSize: '13px', marginTop: '0.5rem', textAlign: 'center', fontFamily: 'var(--font-body)',
              }}>{'✅ downloaded successfully!'}</div>
              <button onClick={handleReset} style={{
                width: '100%', marginTop: '1rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
                borderRadius: 12, padding: '12px', color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px',
                fontWeight: 500, transition: 'all 0.2s ease',
              }}>+ New Download</button>
            </div>
          )}
        </div>
      )}

      <HistoryPanel
        history={history}
        darkMode={darkMode}
        onClear={() => { setHistory([]); localStorage.removeItem('snapload_history') }}
      />

      <div style={{ marginTop: '3rem', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 400, lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
        {'for personal use only. respect platform TOS and copyright.'}
        <br /><br />
        <span style={{
          fontSize: '13px',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
        }}>
          {'🛠️ built by Gowtham'}
        </span>
      </div>

    </div>
  )
}