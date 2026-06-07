import { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import { useReportes } from '../store/reportStore'

const CENTER = [-15.4911, -70.1331]

function HeatmapLayer({ points }) {
  const mapRef = useRef(null)

  useEffect(() => {
    const container = document.querySelector('.heatmap-container')
    if (!container) return
    const map = L.map(container, {
      center: CENTER,
      zoom: 13,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM',
    }).addTo(map)

    if (points.length > 0) {
      const heat = L.heatLayer(points, {
        radius: 30,
        blur: 20,
        maxZoom: 15,
        max: 1.0,
        gradient: { 0.2: '#10b981', 0.5: '#f59e0b', 0.8: '#ef4444' },
      }).addTo(map)
    }
    mapRef.current = map
    return () => map.remove()
  }, [points])

  return null
}

const LEVEL_COLORS = {
  Crítico: { bg: 'from-red-500 to-rose-600', icon: 'warning', trend: 'Atención inmediata' },
  Medio: { bg: 'from-amber-500 to-orange-500', icon: 'pending', trend: 'Requiere supervisión' },
  Bajo: { bg: 'from-emerald-500 to-emerald-600', icon: 'check_circle', trend: 'Monitoreo rutinario' },
  total: { bg: 'from-blue-500 to-blue-600', icon: 'assessment', trend: 'Todas las zonas' },
}

export default function AdminDashboard() {
  const { reports } = useReportes()

  const kpis = useMemo(() => [
    { label: 'Total Reportes', value: reports.length, trend: `${reports.filter(r => r.estado === 'Pendiente').length} pendientes`, icon: 'assessment', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Críticos', value: reports.filter(r => r.nivel === 'Crítico').length, trend: 'Atención inmediata', icon: 'warning', gradient: 'from-red-500 to-rose-600' },
    { label: 'En Proceso', value: reports.filter(r => r.estado === 'En proceso').length, trend: 'Monitoreo activo', icon: 'engineering', gradient: 'from-amber-500 to-orange-500' },
    { label: 'Resueltos', value: reports.filter(r => r.estado === 'Resuelto').length, trend: `${((reports.filter(r => r.estado === 'Resuelto').length / Math.max(reports.length, 1)) * 100).toFixed(0)}% del total`, icon: 'verified', gradient: 'from-emerald-500 to-emerald-600' },
  ], [reports])

  const heatmapPoints = useMemo(() =>
    reports
      .filter(r => r.latitud && r.longitud)
      .map(r => [
        r.latitud,
        r.longitud,
        r.nivel === 'Crítico' ? 1 : r.nivel === 'Medio' ? 0.6 : 0.3,
      ]),
    [reports]
  )

  const criticalAlerts = useMemo(() =>
    reports.filter(r => r.nivel === 'Crítico' || r.estado === 'Pendiente').slice(0, 6),
    [reports]
  )

  const byZone = useMemo(() => {
    const map = {}
    reports.forEach(r => {
      map[r.zona] = (map[r.zona] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [reports])
  const maxZone = byZone.length > 0 ? byZone[0][1] : 1

  const weeklyTrend = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const today = new Date()
    const week = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('es-PE')
      week.push({
        label: days[d.getDay()],
        count: reports.filter(r => r.fecha && r.fecha.includes(d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).split(' ')[0])).length,
      })
    }
    return week
  }, [reports])

  const maxWeek = Math.max(...weeklyTrend.map(d => d.count), 1)

  const zonasCriticas = useMemo(() => {
    const map = {}
    reports.filter(r => r.nivel === 'Crítico').forEach(r => {
      map[r.zona] = (map[r.zona] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [reports])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Panel de Control</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {reports.length} reportes ciudadanos · {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-gray-500">EN VIVO</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className={`bg-gradient-to-br ${kpi.gradient} rounded-2xl p-4 md:p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">{kpi.label}</p>
                <span className="material-symbols-outlined text-white/40">{kpi.icon}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">{kpi.value}</h3>
              <p className="text-[11px] text-white/60 mt-1 font-medium">{kpi.trend}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Mapa de Calor */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">local_fire_department</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Mapa de Calor</h3>
                  <p className="text-[10px] text-gray-400">Concentración de reportes ciudadanos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {['Bajo', 'Medio', 'Crítico'].map((lvl, i) => (
                  <div key={lvl} className="flex items-center gap-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] text-gray-400 font-medium">{lvl}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="heatmap-container w-full h-[320px] md:h-[400px]" />
              <HeatmapLayer points={heatmapPoints} />
              {heatmapPoints.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300">map</span>
                    <p className="text-gray-400 text-sm mt-2">Sin reportes para mostrar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alertas Críticas */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">campaign</span>
                <h3 className="font-bold text-gray-900">Alertas</h3>
              </div>
              {zonasCriticas.length > 0 && (
                <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-lg border border-red-200">
                  {zonasCriticas.length} zonas
                </span>
              )}
            </div>

            {criticalAlerts.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 text-center">
                <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
                <p className="text-sm font-medium text-gray-500 mt-2">Sin alertas activas</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {criticalAlerts.map((alert, i) => (
                  <div key={alert.id || i} className="bg-white border border-gray-200/80 p-3.5 rounded-2xl flex items-start gap-3 hover:shadow-md transition-all cursor-pointer group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                      alert.nivel === 'Crítico' ? 'bg-red-50' : 'bg-amber-50'
                    }`}>
                      <span className={`material-symbols-outlined ${alert.nivel === 'Crítico' ? 'text-red-500' : 'text-amber-500'}`}>
                        {alert.nivel === 'Crítico' ? 'warning' : 'priority_high'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                          alert.nivel === 'Crítico' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {alert.nivel}
                        </span>
                        <span className="text-[9px] text-gray-400 font-medium shrink-0">{alert.estado}</span>
                      </div>
                      <h4 className="text-sm font-bold mt-1 text-gray-900 truncate">{alert.zona}</h4>
                      {alert.descripcion && <p className="text-[11px] text-gray-400 truncate">{alert.descripcion}</p>}
                      {alert.fecha && <p className="text-[9px] text-gray-300 mt-0.5">{alert.fecha}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Segunda fila: zonas + tendencia */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Zonas con más reportes */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">bar_chart</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Zonas con más reportes</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{byZone.length} zonas</span>
            </div>
            <div className="space-y-3">
              {byZone.map(([zona, count], i) => (
                <div key={zona} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">{zona}</span>
                      <span className="text-xs font-bold text-gray-500">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000"
                        style={{ width: `${(count / maxZone) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {byZone.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sin datos de zonas</p>
              )}
            </div>
          </div>

          {/* Tendencia semanal */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">trending_up</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Tendencia semanal</h3>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-40 px-1">
              {weeklyTrend.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-lg hover:brightness-110 transition-all duration-500"
                    style={{ height: `${(d.count / maxWeek) * 100}%` }}
                  />
                  <span className="text-[10px] font-bold text-gray-400">{d.label}</span>
                  <span className="text-[9px] font-bold text-gray-500">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zonas críticas */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">gpp_maybe</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Puntos críticos</h3>
              </div>
            </div>
            <div className="space-y-3">
              {zonasCriticas.map(([zona, count], i) => (
                <div key={zona} className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50/50 hover:bg-red-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-500 text-sm">location_on</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{zona}</p>
                    <p className="text-[10px] text-red-500 font-bold">{count} reporte{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
              {zonasCriticas.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Sin puntos críticos</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
