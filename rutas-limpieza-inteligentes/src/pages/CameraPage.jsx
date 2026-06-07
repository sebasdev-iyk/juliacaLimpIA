import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CameraPage() {
  const navigate = useNavigate()
  const [angle, setAngle] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((Math.sin(Date.now() / 1000) * 2) + (Math.random() - 0.5) * 0.5)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const capture = () => {
    const el = document.getElementById('camera-screen')
    if (el) el.classList.add('brightness-150')
    setTimeout(() => {
      if (el) el.classList.remove('brightness-150')
      navigate('/ciudadano/preview')
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" id="camera-screen">
      <header className="h-16 flex items-center justify-between px-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button className="w-12 h-12 flex items-center justify-center text-white" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex gap-4">
          <button className="w-12 h-12 flex items-center justify-center text-white opacity-60 hover:opacity-100">
            <span className="material-symbols-outlined">flash_off</span>
          </button>
          <button className="w-12 h-12 flex items-center justify-center text-white opacity-60 hover:opacity-100">
            <span className="material-symbols-outlined">hdr_on</span>
          </button>
        </div>
        <div className="w-12" />
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-neutral-900">
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 opacity-80" />
        </div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '33.33% 33.33%',
          pointerEvents: 'none',
        }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-[2px] bg-white/30 relative flex items-center justify-center">
            <div className="w-32 h-[2px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" style={{ transform: `rotate(${angle}deg)` }} />
          </div>
        </div>
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <span className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-semibold border border-white/10">
            Alinea el reporte con la cuadrícula
          </span>
        </div>
      </main>

      <footer className="h-44 bg-black flex flex-col items-center justify-center px-4 gap-8">
        <div className="flex items-center justify-between w-full max-w-sm">
          <div className="w-12 h-12 rounded-lg border-2 border-white/20 overflow-hidden bg-neutral-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/30">photo</span>
          </div>
          <button
            className="w-20 h-20 rounded-full border-[6px] border-white/30 p-1 bg-transparent hover:border-emerald-500/50 transition-colors active:scale-90"
            onClick={capture}
          >
            <div className="w-full h-full bg-white rounded-full" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center text-white bg-white/10 rounded-full">
            <span className="material-symbols-outlined">flip_camera_ios</span>
          </button>
        </div>
      </footer>
    </div>
  )
}
