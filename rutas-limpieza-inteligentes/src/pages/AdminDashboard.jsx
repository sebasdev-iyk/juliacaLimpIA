import { useEffect, useRef, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import { useReportes } from '../store/reportStore'

const PERIODOS = [
  { label: 'Últimos 7 días', dias: 7 },
  { label: 'Últimos 30 días', dias: 30 },
  { label: 'Últimos 90 días', dias: 90 },
  { label: 'Todo el histórico', dias: 9999 },
]
const FILTRO_NIVEL = ['Todos', 'Bajo', 'Medio', 'Crítico']
const FILTRO_ESTADO = ['Todos', 'Pendiente', 'En proceso', 'Resuelto']
const CENTER = [-15.4911, -70.1331]
const GRADIENTE_HEAT = {
  0.0: '#1a237e', 0.15: '#1565c0', 0.3: '#42a5f5',
  0.45: '#66bb6a', 0.6: '#fdd835', 0.75: '#fb8c00',
  0.9: '#e53935', 1.0: '#b71c1c',
}

function HeatLayer({ puntos }) {
  const map = useMap()
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) map.removeLayer(ref.current)
    if (puntos.length > 0) {
      const layer = L.heatLayer(puntos, { radius: 40, blur: 30, maxZoom: 16, max: 1.0, gradient: GRADIENTE_HEAT })
      layer.addTo(map)
      ref.current = layer
    }
    return () => { if (ref.current) map.removeLayer(ref.current) }
  }, [puntos, map])
  return null
}

function LeyendaHeat() {
  const items = [
    { color: '#1a237e', label: 'Muy baja' }, { color: '#1565c0', label: 'Baja' },
    { color: '#66bb6a', label: 'Moderada' }, { color: '#fdd835', label: 'Alta' },
    { color: '#fb8c00', label: 'Muy alta' }, { color: '#b71c1c', label: 'Crítica' },
  ]
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 shadow-xl border border-gray-100 min-w-[180px]">
      <p className="text-[10px] font-bold text-[#1A1D1F] mb-2 uppercase tracking-wider">Intensidad</p>
      <div className="h-3 rounded-full mb-1.5" style={{ background: 'linear-gradient(90deg, #1a237e, #1565c0, #42a5f5, #66bb6a, #fdd835, #fb8c00, #e53935, #b71c1c)' }} />
      <div className="flex justify-between text-[8px] font-medium text-[#6F767E] -mt-0.5 mb-2">
        <span>0%</span><span>100%</span>
      </div>
      <div className="space-y-1">
        {items.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
            <span className="text-[9px] font-medium text-[#6F767E]">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoPanelHeat({ filtrados }) {
  const top = useMemo(() => {
    const map = {}
    filtrados.forEach(r => { map[r.zona] = (map[r.zona] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [filtrados])
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 shadow-xl border border-gray-100 min-w-[200px]">
      <p className="text-[10px] font-bold text-[#1A1D1F] mb-2.5 uppercase tracking-wider">Zonas críticas</p>
      {top.length === 0 ? (
        <p className="text-[9px] text-[#6F767E]">Sin datos</p>
      ) : (
        <div className="space-y-1.5">
          {top.map(([zona, count], i) => (
            <div key={zona} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded text-[7px] font-bold text-white flex items-center justify-center shrink-0 ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-amber-500' : 'bg-blue-400'}`}>{i + 1}</div>
              <span className="text-[10px] font-semibold text-[#1A1D1F] truncate flex-1">{zona}</span>
              <span className="text-[9px] font-bold text-[#6F767E]">{count}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between text-[9px]">
          <span className="text-[#6F767E]">Mostrando</span>
          <span className="font-bold text-[#1A1D1F]">{filtrados.length} reportes</span>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { reports, updateReport } = useReportes()
  const [search, setSearch] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)

  const notificaciones = useMemo(() => {
    return reports
      .filter(r => r.nivel === 'Crítico' || r.nivel === 'Medio')
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 10)
  }, [reports])

  const noLeidas = notificaciones.filter(r => !r.notif_leida).length

  const filtered = useMemo(() => {
    if (!search.trim()) return reports
    const q = search.toLowerCase()
    return reports.filter(r =>
      r.zona?.toLowerCase().includes(q) ||
      r.descripcion?.toLowerCase().includes(q) ||
      r.nivel?.toLowerCase().includes(q) ||
      r.estado?.toLowerCase().includes(q)
    )
  }, [reports, search])

  const kpis = useMemo(() => [
    { label: 'Total Reportes', value: filtered.length, trend: `${filtered.filter(r => r.estado === 'Pendiente').length} pendientes`, icon: 'assessment', color: '#135C3A', iconBg: 'from-emerald-400 to-emerald-600' },
    { label: 'Críticos', value: filtered.filter(r => r.nivel === 'Crítico').length, trend: 'Requieren atención urgente', icon: 'warning', color: '#DC2626', iconBg: 'from-red-400 to-red-600' },
    { label: 'En Proceso', value: filtered.filter(r => r.estado === 'En proceso').length, trend: 'Personal asignado', icon: 'engineering', color: '#D97706', iconBg: 'from-amber-400 to-amber-600' },
    { label: 'Resueltos', value: filtered.filter(r => r.estado === 'Resuelto').length, trend: `${((filtered.filter(r => r.estado === 'Resuelto').length / Math.max(filtered.length, 1)) * 100).toFixed(0)}% del total`, icon: 'verified', color: '#059669', iconBg: 'from-emerald-400 to-emerald-600' },
  ], [filtered])

  const [periodo, setPeriodo] = useState(90)
  const [nivelHeat, setNivelHeat] = useState('Todos')
  const [estadoHeat, setEstadoHeat] = useState('Todos')
  const [verPuntos, setVerPuntos] = useState(false)

  const datosReales = useMemo(() => {
    return reports.filter(r => r.latitud && r.longitud)
  }, [reports])

  const datosFiltrados = useMemo(() => {
    const hoy = new Date()
    const corte = new Date(hoy)
    corte.setDate(corte.getDate() - periodo)
    return datosReales.filter(r => {
      const d = new Date(r.timestamp || Date.parse(r.fecha) || Date.now())
      if (periodo < 9999 && d < corte) return false
      if (nivelHeat !== 'Todos' && r.nivel !== nivelHeat) return false
      if (estadoHeat !== 'Todos' && r.estado !== estadoHeat) return false
      return true
    })
  }, [datosReales, periodo, nivelHeat, estadoHeat])

  const puntosHeat = useMemo(() => {
    const pts = []
    datosFiltrados.forEach(r => {
      const intensidad = r.nivel === 'Crítico' ? 1.0 : r.nivel === 'Medio' ? 0.6 : 0.3
      const n = r.nivel === 'Crítico' ? 8 : r.nivel === 'Medio' ? 5 : 3
      pts.push([r.latitud, r.longitud, intensidad])
      for (let i = 0; i < n; i++) {
        pts.push([
          r.latitud + (Math.random() - 0.5) * 0.006,
          r.longitud + (Math.random() - 0.5) * 0.006,
          Math.max(intensidad * (0.2 + Math.random() * 0.6), 0.05),
        ])
      }
    })
    return pts
  }, [datosFiltrados])

  const criticos = useMemo(() => filtered.filter(r => r.nivel === 'Crítico').slice(0, 5), [filtered])

  const zonasCriticas = useMemo(() => {
    const map = {}
    filtered.filter(r => r.nivel === 'Crítico').forEach(r => { map[r.zona] = (map[r.zona] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [filtered])

  const weeklyTrend = useMemo(() => {
    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const today = new Date()
    return labels.map((label, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (6 - i))
      const dayNum = d.getDate()
      const count = filtered.filter(r => r.fecha?.includes(String(dayNum))).length
      return { label, count, active: i === 3 }
    })
  }, [filtered])

  const maxWeek = Math.max(...weeklyTrend.map(d => d.count), 1)

  const zonasConteo = useMemo(() => {
    const map = {}
    filtered.forEach(r => { map[r.zona] = (map[r.zona] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [filtered])
  const maxZona = zonasConteo.length > 0 ? zonasConteo[0][1] : 1

  const rutasSugeridas = useMemo(() => {
    const criticas = filtered.filter(r => r.nivel === 'Crítico' && r.estado !== 'Resuelto').slice(0, 3)
    if (criticas.length === 0) return []
    return criticas.map((r, i) => ({
      orden: i + 1,
      zona: r.zona,
      desc: r.descripcion?.slice(0, 30) || 'Pendiente',
      lat: r.latitud,
      lng: r.longitud,
    }))
  }, [filtered])

  const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-[#F8F9FA] pb-28">
      {/* Header */}
      <header className="bg-white px-5 py-4 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#135C3A] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-lg">delete</span>
          </div>
          <span className="font-bold text-lg text-[#1A1D1F]">Juliaca LimpIA</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-500 bg-gray-50 relative hover:bg-gray-100 transition-all">
              <span className="material-symbols-outlined text-lg">notifications</span>
              {noLeidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {noLeidas}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#1A1D1F]">Notificaciones</h3>
                      <p className="text-[10px] text-[#6F767E]">{noLeidas} sin leer · {notificaciones.length} total</p>
                    </div>
                    {noLeidas > 0 && (
                      <button onClick={() => {
                        notificaciones.forEach(r => updateReport(r.id, { notif_leida: true }))
                      }} className="text-[10px] font-semibold text-[#135C3A] hover:underline">
                        Leer todas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificaciones.length === 0 ? (
                      <div className="text-center py-10">
                        <span className="material-symbols-outlined text-3xl text-gray-300">notifications_off</span>
                        <p className="text-xs text-gray-400 mt-2">Sin notificaciones</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notificaciones.map((n, i) => (
                          <div key={n.id} className={`flex items-start gap-3 p-3.5 hover:bg-gray-50 cursor-pointer transition-all ${!n.notif_leida ? 'bg-emerald-50/30' : ''}`}
                            onClick={() => { updateReport(n.id, { notif_leida: true }); navigate('/admin/mapa') }}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.nivel === 'Crítico' ? 'bg-red-100' : 'bg-amber-100'}`}>
                              <span className={`material-symbols-outlined text-sm ${n.nivel === 'Crítico' ? 'text-red-500' : 'text-amber-500'}`}>warning</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#1A1D1F] truncate">{n.zona || 'Ubicación desconocida'}</p>
                              <p className="text-[10px] text-[#6F767E] truncate">{n.descripcion || 'Reporte'}</p>
                              <p className="text-[9px] text-gray-300 mt-0.5">{n.fecha || ''}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${n.nivel === 'Crítico' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                {n.nivel}
                              </span>
                              {!n.notif_leida && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-bold">
            AD
          </div>
        </div>
      </header>

      <div className="px-5 pt-6 pb-8 space-y-6 max-w-3xl mx-auto">
        {/* Title & Search */}
        <section className="space-y-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1D1F]">Panel de Monitoreo</h1>
            <p className="text-[#6F767E] text-sm mt-1">Gestiona y prioriza los reportes de residuos en Juliaca.</p>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#135C3A] placeholder:text-gray-400 shadow-card"
              placeholder="Buscar por zona, estado o nivel..."
              type="text"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 hover:bg-gray-100">Limpiar</span>
              </button>
            )}
          </div>
        </section>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className={`relative overflow-hidden rounded-3xl p-5 shadow-card ${i === 0 ? 'bg-[#135C3A] text-white' : 'bg-white border border-gray-100 text-[#1A1D1F]'}`}>
              {i === 0 && (
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              )}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.iconBg} flex items-center justify-center shadow-sm`}>
                  <span className="material-symbols-outlined text-white text-lg">{kpi.icon}</span>
                </div>
                <span className={`text-[11px] font-semibold ${i === 0 ? 'text-white/60' : 'text-[#6F767E]'} uppercase tracking-wider`}>{kpi.label}</span>
              </div>
              <h3 className={`text-4xl font-extrabold mb-1 tracking-tight ${i === 0 ? 'text-white' : 'text-[#1A1D1F]'}`}>{kpi.value}</h3>
              <div className={`flex items-center gap-1 text-xs ${i === 0 ? 'text-white/70' : 'text-[#6F767E]'}`}>
                <span className="material-symbols-outlined text-sm">trending_up</span>
                {kpi.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Mapa de Calor Profesional */}
        <section className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
          {/* Header con filtros */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#1A1D1F]">Mapa de Calor Urbano</h3>
              <p className="text-[10px] text-[#6F767E]">Concentración espacial de residuos en Juliaca</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={periodo} onChange={e => setPeriodo(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold text-[#6F767E] focus:ring-2 focus:ring-[#135C3A]"
              >
                {PERIODOS.map(p => <option key={p.dias} value={p.dias}>{p.label}</option>)}
              </select>
              <select value={nivelHeat} onChange={e => setNivelHeat(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold text-[#6F767E] focus:ring-2 focus:ring-[#135C3A]"
              >
                {FILTRO_NIVEL.map(n => <option key={n} value={n}>Severidad: {n}</option>)}
              </select>
              <select value={estadoHeat} onChange={e => setEstadoHeat(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold text-[#6F767E] focus:ring-2 focus:ring-[#135C3A]"
              >
                {FILTRO_ESTADO.map(e => <option key={e} value={e}>Estado: {e}</option>)}
              </select>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-0.5 flex">
                <button onClick={() => setVerPuntos(false)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${!verPuntos ? 'bg-white text-[#135C3A] shadow-sm' : 'text-[#6F767E]'}`}
                >Calor</button>
                <button onClick={() => setVerPuntos(true)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${verPuntos ? 'bg-white text-[#135C3A] shadow-sm' : 'text-[#6F767E]'}`}
                >Puntos</button>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative h-[520px]">
            {datosFiltrados.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-300">heatmap</span>
                  <p className="text-gray-400 text-sm mt-2">Sin datos para los filtros seleccionados</p>
                </div>
              </div>
            ) : (
              <MapContainer center={CENTER} zoom={13} className="w-full h-full z-0" zoomControl={true} scrollWheelZoom={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
                {!verPuntos && puntosHeat.length > 0 && <HeatLayer puntos={puntosHeat} />}
                {verPuntos && datosFiltrados.map((r, i) => {
                  const color = r.nivel === 'Crítico' ? '#dc2626' : r.nivel === 'Medio' ? '#f59e0b' : '#10b981'
                  const size = r.nivel === 'Crítico' ? 8 : r.nivel === 'Medio' ? 6 : 4
                  return (
                    <CircleMarker key={r.id || i} center={[r.latitud, r.longitud]} radius={size}
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 1.5, opacity: 0.8 }}
                    >
                      <Tooltip direction="top" offset={[0, -size]} className="rounded-xl shadow-lg border-0">
                        <div className="text-xs font-sans min-w-[120px]">
                          <p className="font-bold text-sm text-[#1A1D1F]">{r.zona}</p>
                          <p className="text-[#6F767E] mt-0.5">{r.nivel} · {r.analisis_ia?.confianza || r.confianza}</p>
                          <p className="text-[#6F767E] text-[10px] mt-0.5">{r.fecha}</p>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  )
                })}
              </MapContainer>
            )}

            {/* Leyenda flotante */}
            <div className="absolute top-3 left-3 z-[1000]">
              <LeyendaHeat />
            </div>

            {/* InfoPanel flotante */}
            <div className="absolute top-3 right-3 z-[1000]">
              <InfoPanelHeat filtrados={datosFiltrados} />
            </div>
          </div>
        </section>

        {/* Zonas Críticas + Tendencia Semanal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Zonas Críticas */}
          <section className="bg-white rounded-3xl p-5 shadow-card border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-[#1A1D1F]">Zonas Críticas</h3>
              <span className="text-xs font-semibold bg-red-50 text-red-600 px-2 py-1 rounded-md">{zonasCriticas.length} zonas</span>
            </div>
            {zonasCriticas.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
                <p className="text-sm text-[#6F767E] mt-2">Sin zonas críticas activas</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {zonasCriticas.map(([zona, count], i) => (
                  <div key={zona} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#1A1D1F] truncate">{zona}</p>
                      <p className="text-xs text-[#6F767E]">{count} reporte{count !== 1 ? 's' : ''} crítico{count !== 1 ? 's' : ''}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${i === 0 ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}>#{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tendencia Semanal */}
          <section className="bg-white rounded-3xl p-5 shadow-card border border-gray-100">
            <h3 className="font-bold text-base text-[#1A1D1F] mb-1">Reportes por Día</h3>
            <p className="text-xs text-[#6F767E] mb-6">Últimos 7 días</p>
            <div className="flex items-end justify-between h-32 px-1">
              {weeklyTrend.map((d, i) => {
                const h = d.count > 0 ? Math.max((d.count / maxWeek) * 100, 8) : 8
                return (
                  <div key={i} className="flex flex-col items-center gap-2 relative flex-1">
                    {d.active && d.count > 0 && (
                      <span className="absolute -top-6 text-[10px] font-bold bg-white shadow-sm border border-gray-100 px-1.5 py-0.5 rounded text-gray-600 whitespace-nowrap">{d.count}</span>
                    )}
                    <div
                      className={`w-full max-w-[32px] mx-auto rounded-full ${d.count > 0 ? (d.active ? 'bg-[#52B788]' : 'bg-[#135C3A]') : 'pattern-striped border border-gray-200'}`}
                      style={{ height: `${h}%` }}
                    />
                    <span className={`text-xs ${d.active ? 'font-bold text-[#1A1D1F]' : 'text-gray-400'}`}>{d.label}</span>
                    <span className="text-[9px] text-gray-300 -mt-1">{d.count}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Mapa de Ruta + Últimas Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Ruta de Recolección */}
          <section className="bg-[#0f2e1e] rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, #52B788, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-300">Próxima Ruta</h3>
                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-md">{horaActual}</span>
              </div>
              <p className="text-3xl font-bold mb-1">{rutasSugeridas.length} puntos críticos</p>
              <p className="text-sm text-gray-300 mb-5">Pendientes de atención urgente</p>

              {rutasSugeridas.length === 0 ? (
                <div className="text-center py-4">
                  <span className="material-symbols-outlined text-3xl text-emerald-400/70">check_circle</span>
                  <p className="text-sm text-gray-400 mt-1">Sin rutas pendientes</p>
                </div>
              ) : (
                <div className="space-y-2 mb-5">
                  {rutasSugeridas.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{r.orden}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{r.zona}</p>
                        <p className="text-xs text-gray-300 truncate">{r.desc}</p>
                      </div>
                      <span className="material-symbols-outlined text-white/40 text-sm">arrow_forward</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => navigate('/admin/mapa')} className="w-full bg-white text-[#135C3A] py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-95 active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined text-lg">route</span>
                Iniciar Ruta de Recolección
              </button>
            </div>
          </section>

          {/* Últimas Alertas */}
          <section className="bg-white rounded-3xl p-5 shadow-card border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#1A1D1F]">Alertas en Tiempo Real</h3>
              <span className="text-xs font-semibold text-[#6F767E]">{criticos.length} activas</span>
            </div>
            <div className="space-y-3">
              {criticos.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
                  <p className="text-sm text-[#6F767E] mt-2">Sin alertas activas</p>
                </div>
              ) : (
                criticos.map((a, i) => (
                  <div key={a.id || i} className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/admin/mapa')}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#1A1D1F] truncate">{a.zona}</p>
                        <p className="text-xs text-[#6F767E] truncate">{a.descripcion || 'Reporte crítico'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {a.fecha && <span className="text-[10px] text-gray-400">{a.fecha.split('·')[1]?.trim() || a.fecha}</span>}
                      <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {criticos.length > 0 && (
              <button onClick={() => navigate('/admin/mapa')} className="w-full mt-3 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-[#6F767E] hover:border-[#135C3A] hover:text-[#135C3A] transition-all">
                Ver todas en el mapa
              </button>
            )}
          </section>
        </div>

        {/* Distribución por Zonas */}
        <section className="bg-white rounded-3xl p-5 shadow-card border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-[#1A1D1F]">Distribución por Zonas</h3>
              <p className="text-xs text-[#6F767E] mt-0.5">Concentración de reportes por sector</p>
            </div>
            <span className="text-xs font-semibold text-[#6F767E]">{zonasConteo.length} zonas</span>
          </div>
          {zonasConteo.length === 0 ? (
            <p className="text-sm text-[#6F767E] text-center py-6">Sin datos de zonas</p>
          ) : (
            <div className="space-y-3.5">
              {zonasConteo.map(([zona, count], i) => (
                <div key={zona} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#1A1D1F] truncate">{zona}</span>
                      <span className="text-xs font-bold text-[#6F767E] ml-2 shrink-0">{count} rep.</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#52B788] to-[#135C3A] transition-all duration-1000"
                        style={{ width: `${(count / maxZona) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
