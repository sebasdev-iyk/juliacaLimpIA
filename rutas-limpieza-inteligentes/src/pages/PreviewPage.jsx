import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReportes } from '../store/reportStore'
import { analyzeImage } from '../services/aiAnalyzer'

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
  const [foto] = useState(() => sessionStorage.getItem('current_foto') || '')
  const [scanning, setScanning] = useState(true)
  const [scanProgress, setScanProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [aiError, setAiError] = useState(null)

  useEffect(() => {
    if (!foto) navigate('/ciudadano/camara', { replace: true })
  }, [])

  useEffect(() => {
    if (!foto) return
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 4 + 1
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }
      setScanProgress(Math.min(progress, 100))
    }, 80)

    const runAnalysis = async () => {
      const blob = await (await fetch(foto)).blob()
      const file = new File([blob], 'captura.jpg', { type: 'image/jpeg' })
      try {
        const analysis = await analyzeImage(file, null)
        setResult(analysis)
        setNivel(analysis.nivel)
        if (analysis.fallback_simulado) {
          setAiError('Servidor AI no disponible — resultado simulado. Para análisis real, inicia el servicio YOLO-World.')
        }
      } catch (err) {
        console.error('Error en análisis IA:', err)
        setAiError('Error al analizar la imagen')
        setResult({
          basura_detectada: true,
          nivel: 'Medio',
          confianza: '0%',
          prioridad: 'Media',
          resumen: 'Error de análisis — usa selección manual',
          metodo: 'Error',
          es_real: false,
          objetos: [],
        })
      } finally {
        clearInterval(interval)
        setScanProgress(100)
        setTimeout(() => {
          setScanning(false)
          setShowResults(true)
        }, 400)
      }
    }

    runAnalysis()
    return () => clearInterval(interval)
  }, [foto])

  const handleSubmit = () => {
    setSending(true)
    const coords = ZONE_COORDS[zone] || { lat: -15.4911, lng: -70.1331 }
    const now = new Date()
    let ubicacion = null
    try {
      const raw = sessionStorage.getItem('current_ubicacion')
      if (raw) ubicacion = JSON.parse(raw)
    } catch {}

    const report = {
      id: Date.now(),
      zona: zone,
      descripcion: comment || 'Reporte ciudadano',
      latitud: ubicacion ? parseFloat(ubicacion.lat) + (Math.random() - 0.5) * 0.002 : coords.lat + (Math.random() - 0.5) * 0.004,
      longitud: ubicacion ? parseFloat(ubicacion.lng) + (Math.random() - 0.5) * 0.002 : coords.lng + (Math.random() - 0.5) * 0.004,
      nivel: nivel,
      confianza: result?.confianza || '0%',
      prioridad: result?.prioridad || 'Media',
      estado: 'Pendiente',
      fecha: now.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      comentario: comment,
      foto: foto,
      objetos: result?.objetos || [],
      metodo_ia: result?.metodo || 'Ninguno',
      es_real: result?.es_real || false,
    }

    addReport(report)
    sessionStorage.removeItem('current_foto')
    sessionStorage.removeItem('current_ubicacion')
    setTimeout(() => navigate('/ciudadano/mapa', { replace: true }), 400)
  }

  const getLevelColor = (lvl) => {
    if (lvl === 'Crítico') return 'bg-red-50 text-red-600 border-red-200'
    if (lvl === 'Medio') return 'bg-amber-50 text-amber-600 border-amber-200'
    return 'bg-emerald-50 text-emerald-600 border-emerald-200'
  }

  const getLevelBar = (lvl) => {
    if (lvl === 'Crítico') return 'from-red-500 to-red-600'
    if (lvl === 'Medio') return 'from-amber-500 to-amber-600'
    return 'from-emerald-500 to-emerald-600'
  }

  return (
    <div className="fixed inset-0 z-40 bg-gray-50 overflow-y-auto">
      <div className="min-h-screen pb-8">
        {/* Header */}
        <nav className="sticky top-0 z-50 flex justify-between items-center px-5 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-base">eco</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Confirmar Reporte</span>
              {scanning && <p className="text-[10px] text-emerald-500 font-semibold">Analizando con IA...</p>}
            </div>
          </div>
          <button onClick={() => navigate('/ciudadano')} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </nav>

        <div className="px-5 pt-5 space-y-4 max-w-lg mx-auto">
          {/* Photo card con escaneo */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] bg-gray-900">
            <img src={foto} alt="Captura" className="w-full h-full object-cover" />

            {scanning && (
              <div className="absolute inset-0">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }} />
                <div
                  className="absolute left-0 right-0 h-1"
                  style={{
                    top: `${scanProgress}%`,
                    background: 'linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent)',
                    boxShadow: '0 0 20px rgba(16,185,129,0.6), 0 0 60px rgba(16,185,129,0.3)',
                    filter: 'blur(1px)',
                    transition: 'top 0.08s linear',
                  }}
                />
                {['top-4 left-4 border-t-2 border-l-2', 'top-4 right-4 border-t-2 border-r-2', 'bottom-4 left-4 border-b-2 border-l-2', 'bottom-4 right-4 border-b-2 border-r-2'].map((pos, i) => (
                  <div key={i} className={`absolute w-6 h-6 border-emerald-400/70 ${pos}`} />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-white font-semibold text-sm">Analizando con IA...</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900/50">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-200" style={{ width: `${scanProgress}%` }} />
                </div>
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 border border-white/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  IA analizando
                </div>
              </div>
            )}

            {/* Resultados del análisis sobre la foto */}
            {showResults && result?.objetos?.length > 0 && (
              <div className="absolute inset-0">
                {result.objetos.slice(0, 6).map((obj, i) => {
                  if (!obj.bbox) return null
                  const [x1, y1, x2, y2] = obj.bbox
                  const w = 500, h = 375
                  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
                  const color = colors[i % colors.length]
                  return (
                    <div
                      key={i}
                      className="absolute border-2 rounded-lg animate-fade-in"
                      style={{
                        left: `${(x1 / w) * 100}%`,
                        top: `${(y1 / h) * 100}%`,
                        width: `${((x2 - x1) / w) * 100}%`,
                        height: `${((y2 - y1) / h) * 100}%`,
                        borderColor: color,
                        background: `${color}18`,
                      }}
                    >
                      <span className="absolute -top-4.5 left-0 text-[8px] font-bold px-1 py-0.5 rounded-t-sm whitespace-nowrap text-white" style={{ background: color }}>
                        {obj.clase} {(obj.confianza * 100).toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className={`absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl border ${scanning ? 'bg-black/50 border-white/10' : 'bg-white/90 border-gray-200 shadow-sm'}`}>
              <span className={`material-symbols-outlined text-lg ${scanning ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {scanning ? 'radar' : 'check_circle'}
              </span>
              <span className={`text-xs font-semibold ${scanning ? 'text-white' : 'text-gray-700'}`}>
                {scanning ? 'Analizando...' : 'Análisis completo'}
              </span>
            </div>
          </div>

          {/* Resultados del análisis */}
          {showResults && result && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md animate-fade-in-up">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600 text-lg">radar</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Análisis con IA</h3>
                    <p className="text-[10px] text-gray-400">{result.metodo || 'Detección'}</p>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getLevelColor(result.nivel)}`}>
                  {result.nivel} · {result.confianza}
                </div>
              </div>

              {/* Advertencia si es simulado */}
              {aiError && (
                <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                  <p className="text-xs text-amber-700">{aiError}</p>
                </div>
              )}

              {/* Métricas */}
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Basura</p>
                  <p className="text-base font-bold text-emerald-700">{result.basura_detectada ? 'Detectada' : 'No detectada'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Prioridad</p>
                  <p className="text-base font-bold text-blue-700">{result.prioridad}</p>
                </div>
              </div>

              {/* Objetos detectados */}
              {result.objetos?.length > 0 && (
                <div className="px-4 pb-4 space-y-1.5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Objetos detectados ({result.objetos.length})
                  </p>
                  {result.objetos.slice(0, 8).map((obj, i) => {
                    const colors = ['from-amber-400 to-orange-500', 'from-yellow-400 to-amber-500', 'from-blue-400 to-blue-500', 'from-gray-400 to-gray-500', 'from-purple-400 to-purple-500', 'from-rose-400 to-rose-500']
                    return (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center`}>
                            <span className="material-symbols-outlined text-white text-xs">delete</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{obj.clase}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]} transition-all duration-1000`} style={{ width: `${(obj.confianza * 100).toFixed(0)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-500 w-8 text-right">{(obj.confianza * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Severity selector */}
          <div className={scanning ? 'opacity-40 pointer-events-none' : ''}>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">warning</span>
              Nivel de severidad
              {!scanning && <span className="text-[9px] text-gray-400 font-normal normal-case">(ajustable)</span>}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {NIVELES.map(n => (
                <button key={n.key} onClick={() => setNivel(n.key)}
                  className={`py-3.5 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${nivel === n.key ? `${n.color} shadow-md scale-[1.02]` : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
                >
                  {n.key}
                </button>
              ))}
            </div>
          </div>

          {/* Zone selector */}
          <div className={scanning ? 'opacity-40 pointer-events-none' : ''}>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">location_on</span>
              Zona
            </label>
            <select value={zone} onChange={e => setZone(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-400 bg-white text-gray-900 font-medium transition-all shadow-sm"
            >
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          {/* Comment */}
          <div className={scanning ? 'opacity-40 pointer-events-none' : ''}>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">edit</span>
              Comentario
            </label>
            <textarea className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-400 bg-white text-gray-900 transition-all resize-none h-20 shadow-sm"
              maxLength={100} value={comment} onChange={e => setComment(e.target.value)} placeholder="Describe el problema..."
            />
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button onClick={handleSubmit} disabled={sending || scanning}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : scanning ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analizando...
                </span>
              ) : (
                <><span className="material-symbols-outlined">send</span> Enviar Reporte</>
              )}
            </button>
            <button onClick={() => { sessionStorage.removeItem('current_foto'); sessionStorage.removeItem('current_ubicacion'); navigate('/ciudadano/camara') }}
              className="w-full py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-base hover:border-gray-300 hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span> Retomar foto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
