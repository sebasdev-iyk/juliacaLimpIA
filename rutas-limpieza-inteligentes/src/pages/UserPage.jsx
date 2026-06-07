import { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useReports } from '../context/ReportsContext'
import { JULIACA_CENTER } from '../data/mockReports'
import { ChevronLeft, ChevronRight, MapPin, Camera, Check } from 'lucide-react'

function LocationMarker({ position, onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange([e.latlng.lat, e.latlng.lng])
    },
  })
  return position ? (
    <Marker position={position} icon={L.divIcon({
      html: `<div style="width:24px;height:24px;background:#ef4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })} />
  ) : null
}

const STEPS = [
  { key: 'location', icon: MapPin, label: 'Ubicación' },
  { key: 'photo', icon: Camera, label: 'Foto' },
]

export default function UserPage() {
  const { addReport } = useReports()
  const log = (msg, data) => console.log(`[${new Date().toLocaleTimeString()}] UserPage: ${msg}`, data ?? '')
  log('render')

  const [step, setStep] = useState(0)
  const [position, setPosition] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef(null)

  const canGoNext = () => {
    if (step === 0) return position !== null
    if (step === 1) return imageFile !== null
    return true
  }

  const handleSubmit = async () => {
    if (!position) return
    log('iniciando submit')

    let imageBase64 = null
    if (imageFile) {
      log('convirtiendo imagen a base64', { size: imageFile.size })
      imageBase64 = await fileToBase64(imageFile)
      log('imagen convertida', { base64Length: imageBase64.length })
    }

    const report = {
      id: Date.now(),
      descripcion: 'Reporte desde la app',
      latitud: position[0],
      longitud: position[1],
      nivel: 'Pendiente',
      confianza: '—',
      prioridad: '—',
      estado: 'Pendiente',
      fecha: new Date().toLocaleDateString('es-PE'),
      imagen_b64: imageBase64,
    }
    log('agregando reporte', report)
    addReport(report)
    log('reporte agregado, verificando localStorage...', localStorage.getItem('juliaca_reports')?.slice(0, 200))
    setSubmitted(true)
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const MAX = 600
        if (width > MAX || height > MAX) {
          if (width > height) { height = (height / width) * MAX; width = MAX }
          else { width = (width / height) * MAX; height = MAX }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  if (submitted) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', gap: 16,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--color-primary-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={36} color="var(--color-primary)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Reporte enviado</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 260 }}>
          Gracias por ayudar a mantener Juliaca limpia
        </p>
        <button
          onClick={() => { setSubmitted(false); setStep(0); setPosition(null); setImageFile(null); setImagePreview(null) }}
          style={{
            marginTop: 8, padding: '14px 40px', borderRadius: 12,
            background: 'var(--color-primary)', color: 'white', border: 'none',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Reportar otro
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 16px 12px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Reportar basura</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 0, padding: '0 16px 16px' }}>
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = i === step
          const isDone = i < step
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 120 }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone || isActive ? 'var(--color-primary)' : 'var(--bg-active)',
                  color: isDone || isActive ? 'white' : 'var(--text-muted)',
                  fontSize: 14, transition: 'all 0.2s',
                }}>
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2,
                  background: isDone ? 'var(--color-primary)' : 'var(--border-color)',
                  marginBottom: 18, transition: 'background 0.2s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {step === 0 && (
          <div style={{ height: '100%', position: 'relative' }}>
            <MapContainer
              center={JULIACA_CENTER}
              zoom={14}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker position={position} onLocationChange={setPosition} />
            </MapContainer>
            {!position && (
              <div style={{
                position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000,
                background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: 13,
                padding: '10px 16px', borderRadius: 10, textAlign: 'center',
              }}>
                Haz clic en el mapa para marcar dónde está la basura
              </div>
            )}
            {position && (
              <div style={{
                position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 1000,
                background: 'var(--color-primary)', color: 'white', fontSize: 12,
                padding: '8px 16px', borderRadius: 8, textAlign: 'center', fontWeight: 600,
              }}>
                Ubicación marcada
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div style={{ height: '100%', padding: '0 16px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: '100%', borderRadius: 12,
                border: '2px dashed var(--report-image-upload-border)',
                background: 'var(--report-image-upload-bg)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden',
                position: 'relative',
              }}
            >
              {!imagePreview ? (
                <>
                  <Camera size={40} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                  <span style={{ fontSize: 14, color: 'var(--report-image-label)', fontWeight: 500 }}>
                    Toca para tomar o subir foto
                  </span>
                </>
              ) : (
                <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)) }
              }}
              style={{ display: 'none' }}
            />
          </div>
        )}


      </div>

      <div style={{
        padding: '12px 16px 20px', display: 'flex', gap: 8,
        borderTop: '1px solid var(--border-color)',
      }}>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              flex: 1, height: 48, borderRadius: 10,
              border: '1.5px solid var(--border-color)',
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            <ChevronLeft size={18} /> Atrás
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canGoNext()}
            style={{
              flex: step > 0 ? 1 : undefined, minWidth: step === 0 ? '100%' : undefined,
              height: 48, borderRadius: 10, padding: '0 24px',
              border: 'none',
              background: canGoNext() ? 'var(--color-primary)' : 'var(--disabled-bg)',
              color: canGoNext() ? 'white' : 'var(--disabled-text)',
              fontSize: 14, fontWeight: 600, cursor: canGoNext() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            Siguiente <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            style={{
              flex: 1, height: 48, borderRadius: 10,
              border: 'none',
              background: 'var(--color-primary)',
              color: 'white',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            Enviar reporte <Check size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
