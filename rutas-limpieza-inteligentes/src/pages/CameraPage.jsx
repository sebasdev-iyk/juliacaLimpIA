import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CameraPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [flash, setFlash] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [ubicacion, setUbicacion] = useState(null)
  const [locError, setLocError] = useState(null)

  useEffect(() => {
    startCamera()
    requestLocation()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setCameraReady(true)
        }
      }
    } catch (err) {
      console.error('Error de cámara:', err)
      setCameraError('No se pudo acceder a la cámara. Puedes subir una imagen manualmente.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocalización no disponible')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4),
        })
      },
      (err) => {
        console.error('Error de ubicación:', err)
        setLocError('Activa la ubicación para una mejor experiencia')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const captureFromVideo = () => {
    const video = videoRef.current
    if (!video) return
    const c = document.createElement('canvas')
    c.width = video.videoWidth || 640
    c.height = video.videoHeight || 480
    const ctx = c.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const foto = c.toDataURL('image/jpeg', 0.85)
    finishCapture(foto)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const foto = ev.target.result
      stopCamera()
      finishCapture(foto)
    }
    reader.readAsDataURL(file)
  }

  const finishCapture = (foto) => {
    setFlash(true)
    sessionStorage.setItem('current_foto', foto)
    if (ubicacion) {
      sessionStorage.setItem('current_ubicacion', JSON.stringify(ubicacion))
    }
    setTimeout(() => {
      setFlash(false)
      navigate('/ciudadano/preview')
    }, 350)
  }

  const retryCamera = () => {
    setCameraError(null)
    setCameraReady(false)
    startCamera()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black" id="camera-screen">
      {/* Flash */}
      {flash && (
        <div className="absolute inset-0 bg-white z-50 animate-fade-in pointer-events-none" />
      )}

      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 h-16 bg-gradient-to-b from-black/70 to-transparent">
        <button className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all" onClick={() => { stopCamera(); navigate(-1) }}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex items-center gap-2">
          {ubicacion ? (
            <div className="bg-emerald-500/20 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-400/30">
              <span className="material-symbols-outlined text-emerald-400 text-sm">gps_fixed</span>
              <span className="text-emerald-400 text-[10px] font-bold">{ubicacion.lat}, {ubicacion.lng}</span>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/10" onClick={requestLocation}>
              <span className="material-symbols-outlined text-amber-400 text-sm">gps_off</span>
              <span className="text-white/60 text-[10px] font-medium">Sin ubicación</span>
            </div>
          )}
        </div>
        <label className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer">
          <span className="material-symbols-outlined">photo_library</span>
          <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
        </label>
      </header>

      {/* Viewfinder */}
      <main className="flex-1 h-full relative">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-8">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-white/40">videocam_off</span>
            </div>
            <p className="text-white/70 text-center mb-2">{cameraError}</p>
            <label className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30">
              Subir imagen
              <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
            </label>
            <button onClick={retryCamera} className="mt-3 px-6 py-2.5 bg-white/10 text-white/70 rounded-xl text-sm font-medium hover:bg-white/20 transition-all">
              Reintentar cámara
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
            />
            <div className="absolute inset-0 camera-grid pointer-events-none" />

            {/* Loading camera */}
            {!cameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="w-12 h-12 border-2 border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin mb-4" />
                <p className="text-white/50 text-sm font-medium">Iniciando cámara...</p>
              </div>
            )}

            {/* Corner guides */}
            {['top-4 left-4 border-t-2 border-l-2', 'top-4 right-4 border-t-2 border-r-2', 'bottom-32 left-4 border-b-2 border-l-2', 'bottom-32 right-4 border-b-2 border-r-2'].map((pos, i) => (
              <div key={i} className={`absolute w-8 h-8 border-emerald-400/60 ${pos}`} />
            ))}

            {/* Grid lines overlay */}
            {cameraReady && (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-[1px] bg-white/10 absolute top-1/3" />
                  <div className="w-full h-[1px] bg-white/10 absolute top-2/3" />
                  <div className="h-full w-[1px] bg-white/10 absolute left-1/3" />
                  <div className="h-full w-[1px] bg-white/10 absolute left-2/3" />
                </div>
                {/* Location error toast */}
                {locError && (
                  <div className="absolute bottom-44 left-0 right-0 flex justify-center">
                    <div className="bg-amber-500/20 backdrop-blur-xl border border-amber-400/30 px-4 py-2 rounded-2xl flex items-center gap-2" onClick={requestLocation}>
                      <span className="material-symbols-outlined text-amber-400 text-sm">location_searching</span>
                      <span className="text-amber-300 text-xs font-medium">{locError} — Toca para activar</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Instruction */}
            <div className="absolute bottom-40 left-0 right-0 flex justify-center pointer-events-none">
              <span className="bg-black/40 backdrop-blur-xl text-white/90 px-5 py-2 rounded-2xl text-sm font-medium border border-white/10">
                {cameraReady ? 'Enfoca y captura el reporte' : 'Preparando cámara...'}
              </span>
            </div>
          </>
        )}
      </main>

      {/* Bottom controls */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-8">
        <div className="flex items-center justify-center gap-8">
          <button className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined text-2xl">flip_camera_ios</span>
          </button>

          <button
            onClick={captureFromVideo}
            disabled={!cameraReady}
            className="relative w-20 h-20 rounded-full bg-white/10 p-1 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
          >
            <div className="w-full h-full rounded-full bg-white shadow-xl" />
            <div className="absolute inset-1 rounded-full border-2 border-white/30" />
          </button>

          <label className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:bg-white/20 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-2xl">photo_library</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </footer>
    </div>
  )
}
