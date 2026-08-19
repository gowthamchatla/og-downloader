export default function FloatingOrbs() {
  const orbs = [
    { size: 300, top: '5%', left: '10%', color: 'rgba(124,58,237,0.15)', delay: '0s', dur: '8s' },
    { size: 200, top: '60%', right: '5%', color: 'rgba(6,182,212,0.12)', delay: '2s', dur: '10s' },
    { size: 150, top: '30%', left: '70%', color: 'rgba(244,114,182,0.1)', delay: '1s', dur: '7s' },
    { size: 100, top: '80%', left: '20%', color: 'rgba(124,58,237,0.08)', delay: '3s', dur: '9s' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: orb.color,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            filter: 'blur(60px)',
            animation: `float ${orb.dur} ease-in-out infinite`,
            animationDelay: orb.delay,
          }}
        />
      ))}
    </div>
  )
}
