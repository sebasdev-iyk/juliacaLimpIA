import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CameraPage() {
  const navigate = useNavigate()
  const [angle, setAngle] = useState(0)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((Math.sin(Date.now() / 800) * 3) + (Math.random() - 0.5) * 0.3)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const capture = () => {
    setFlash(true)
    const c = document.createElement('canvas')
    c.width = 640; c.height = 480
    const ctx = c.getContext('2d')
    const grad = ctx.createRadialGradient(320, 240, 50, 320, 240, 400)
    grad.addColorStop(0, '#065f46')
    grad.addColorStop(0.5, '#047857')
    grad.addColorStop(1, '#064e3b')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 640, 480)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    for (let i = 0; i < 60; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * 640, Math.random() * 480, Math.random() * 3 + 1, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(0, 380, 640, 100)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('Juliaca · ' + new Date().toLocaleDateString('es-PE'), 30, 420)
    ctx.font = '14px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText('Reporte ciudadano', 30, 448)
    const foto = c.toDataURL('image/jpeg', 0.85)
    sessionStorage.setItem('current_foto', foto)
    setTimeout(() => {
      setFlash(false)
      navigate('/ciudadano/preview')
    }, 350)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black" id="camera-screen">
      {/* Flash */}
      {flash && (
        <div className="absolute inset-0 bg-white z-50 animate-fade-in pointer-events-none" />
      )}

      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 h-16 bg-gradient-to-b from-black/70 to-transparent">
        <button className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex gap-3">
          {['flash_off', 'hdr_on'].map(icon => (
            <button key={icon} className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          ))}
        </div>
        <div className="w-11" />
      </header>

      {/* Viewfinder */}
      <main className="flex-1 h-full relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 camera-grid" />

        {/* Corner guides */}
        {[
          'top-4 left-4 border-t-2 border-l-2',
          'top-4 right-4 border-t-2 border-r-2',
          'bottom-32 left-4 border-b-2 border-l-2',
          'bottom-32 right-4 border-b-2 border-r-2',
        ].map((pos, i) => (
          <div key={i} className={`absolute w-8 h-8 border-emerald-400/60 ${pos}`} />
        ))}

        {/* Leveler */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-56 h-[2px] bg-white/20" />
            <div
              className="absolute top-0 left-1/2 h-[2px] bg-emerald-400 shadow-lg shadow-emerald-500/50"
              style={{
                width: '120px',
                transform: `translateX(-50%) rotate(${angle}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
            />
          </div>
        </div>

        {/* Instruction */}
        <div className="absolute bottom-40 left-0 right-0 flex justify-center">
          <span className="bg-black/40 backdrop-blur-xl text-white/90 px-5 py-2 rounded-2xl text-sm font-medium border border-white/10">
            Alinea el reporte con la cuadrícula
          </span>
        </div>
      </main>

      {/* Bottom controls */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-8">
        <div className="flex items-center justify-center gap-8">
          <button className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined text-2xl">flip_camera_ios</span>
          </button>

          <button
            onClick={capture}
            className="relative w-20 h-20 rounded-full bg-white/10 p-1 hover:scale-105 active:scale-95 transition-all"
          >
            <div className="w-full h-full rounded-full bg-white shadow-xl" />
            <div className="absolute inset-1 rounded-full border-2 border-white/30" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md" />
        </div>
      </footer>
    </div>
  )
}
