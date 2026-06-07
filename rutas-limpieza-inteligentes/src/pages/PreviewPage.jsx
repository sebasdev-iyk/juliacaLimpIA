import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReportes } from '../store/reportStore'

const ZONES = [
  'Plaza de Armas', 'Mercado Santa Bárbara', 'Terminal Terrestre',
  'Universidad Andina', 'Av. Circunvalación', 'Zona Industrial',
  'Barrio La Era', 'Cerro Santa Bárbara', 'Salida Cusco',
  'Salida Arequipa', 'Estadio', 'Aeropuerto',
]

const ZONE_COORDS = {
  'Plaza de Armas': { lat: -15.4908, lng: -70.1325 },
  'Mercado Santa Bárbara': { lat: -15.4905, lng: -70.1345 },
  'Terminal Terrestre': { lat: -15.4940, lng: -70.1370 },
  'Universidad Andina': { lat: -15.4870, lng: -70.1200 },
  'Av. Circunvalación': { lat: -15.4920, lng: -70.1280 },
  'Zona Industrial': { lat: -15.4950, lng: -70.1400 },
  'Barrio La Era': { lat: -15.4890, lng: -70.1260 },
  'Cerro Santa Bárbara': { lat: -15.4860, lng: -70.1350 },
  'Salida Cusco': { lat: -15.4850, lng: -70.1150 },
  'Salida Arequipa': { lat: -15.4980, lng: -70.1380 },
  'Estadio': { lat: -15.4880, lng: -70.1300 },
  'Aeropuerto': { lat: -15.4770, lng: -70.1570 },
}

const NIVELES = [
  { key: 'Bajo', color: 'border-emerald-500 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  { key: 'Medio', color: 'border-amber-500 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  { key: 'Crítico', color: 'border-red-500 bg-red-50 text-red-700', dot: 'bg-red-500' },
]

export default function PreviewPage() {
  const navigate = useNavigate()
  const { addReport } = useReportes()
  const [comment, setComment] = useState('')
  const [zone, setZone] = useState(ZONES[0])
  const [nivel, setNivel] = useState('Medio')
  const [sending, setSending] = useState(false)

  const handleSubmit = () => {
    setSending(true)
    const coords = ZONE_COORDS[zone] || { lat: -15.4911, lng: -70.1331 }
    const now = new Date()

    const report = {
      id: Date.now(),
      zona: zone,
      descripcion: comment || 'Reporte ciudadano',
      latitud: coords.lat + (Math.random() - 0.5) * 0.004,
      longitud: coords.lng + (Math.random() - 0.5) * 0.004,
      nivel: nivel,
      confianza: nivel === 'Crítico' ? '93%' : nivel === 'Medio' ? '85%' : '76%',
      prioridad: nivel === 'Crítico' ? 'Alta' : nivel === 'Medio' ? 'Media' : 'Baja',
      estado: 'Enviado',
      fecha: now.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      comentario: comment,
    }

    addReport(report)
    setTimeout(() => navigate('/ciudadano/mapa', { replace: true }), 400)
  }

  return (
    <div className="fixed inset-0 z-40 gradient-bg-light overflow-y-auto">
      <div className="min-h-screen pb-8">
        {/* Header */}
        <nav className="sticky top-0 z-50 flex justify-between items-center px-5 h-16 bg-white/70 backdrop-blur-xl border-b border-emerald-100/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-base">eco</span>
            </div>
            <span className="font-bold text-emerald-700">Confirmar Reporte</span>
          </div>
          <button onClick={() => navigate('/ciudadano')} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </nav>

        <div className="px-5 pt-5 space-y-5">
          {/* Photo card */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50 aspect-[4/3] flex items-center justify-center group">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-200/50 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-4xl text-emerald-400">photo_camera</span>
              </div>
              <p className="text-emerald-600 font-medium">Foto capturada ✓</p>
            </div>
            <div className="absolute bottom-3 left-3 glass-dark px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
              <span className="text-white text-xs font-semibold">GPS · Juliaca</span>
            </div>
          </div>

          {/* Severity selector */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Nivel de severidad</label>
            <div className="grid grid-cols-3 gap-2">
              {NIVELES.map(n => (
                <button
                  key={n.key}
                  onClick={() => setNivel(n.key)}
                  className={`py-3.5 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
                    nivel === n.key ? `${n.color} shadow-md scale-[1.02]` : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {n.key}
                </button>
              ))}
            </div>
          </div>

          {/* Zone selector */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Zona</label>
            <select
              value={zone}
              onChange={e => setZone(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-400 bg-white/80 text-gray-900 font-medium transition-all shadow-sm"
            >
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Comentario (opcional)</label>
            <textarea
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-400 bg-white/80 text-gray-900 transition-all resize-none h-24 shadow-sm"
              maxLength={100}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Describe el problema..."
            />
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  Enviar Reporte
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/ciudadano/camara')}
              className="w-full py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-base hover:border-gray-300 hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span>
              Retomar foto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
