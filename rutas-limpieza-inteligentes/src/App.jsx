import { useState, useCallback } from 'react'
import MapView from './components/MapView'
import ReportForm from './components/ReportForm'
import StatsCards from './components/StatsCards'
import RoutePanel from './components/RoutePanel'
import { INITIAL_REPORTS, START_DISPLAY } from './data/mockReports'
import { generateSmartRoute } from './utils/routeOptimizer'
import { fetchRouteFromOSRM, simulateRoadRoute } from './utils/osrmRouter'
import { Plus, Truck, X } from 'lucide-react'
import './styles.css'

export default function App() {
  const [reports, setReports] = useState(INITIAL_REPORTS)
  const [route, setRoute] = useState(null)
  const [routeGeometry, setRouteGeometry] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [routeSource, setRouteSource] = useState(null) // 'osrm' | 'simulated' | null
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [mapKey, setMapKey] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.nivel === 'Crítico').length,
    distance: route?.distance || 0,
    savings: route?.savingsPercent || 0,
  }

  const handleAddReport = useCallback((report) => {
    // Limpiar ruta anterior si existe
    if (route) { setRoute(null); setRouteGeometry(null); setRouteSource(null) }
    setReports(prev => [report, ...prev])
    setShowForm(false)
  }, [route])

  const handleGenerateRoute = useCallback(async () => {
    if (reports.length === 0) return

    // 1. Ordenar puntos por prioridad
    const result = generateSmartRoute(reports)
    setRoute(result)
    setSelectedIds(new Set(result.orderedPoints.map(r => r.id)))
    setLoadingRoute(true)
    setRouteSource(null)
    setRouteGeometry(null)

    // 2. Construir waypoints: [inicio, ...puntos ordenados]
    const waypoints = [
      { lat: START_DISPLAY.lat, lng: START_DISPLAY.lng },
      ...result.orderedPoints.map(p => ({ lat: p.latitud, lng: p.longitud })),
    ]

    // 3. Intentar OSRM real, fallback a simulación
    try {
      const osrmResult = await fetchRouteFromOSRM(waypoints)
      setRouteGeometry(osrmResult.geometry)
      setRouteSource('osrm')
      // Actualizar métricas con datos reales de OSRM
      setRoute(prev => ({
        ...prev,
        distance: osrmResult.distanceKm,
        time: osrmResult.durationMin,
        fuel: Math.round(osrmResult.distanceKm * 0.4 * 10) / 10,
        co2: Math.round(osrmResult.distanceKm * 0.4 * 2.68 * 10) / 10,
        savingsPercent: Math.round(((osrmResult.distanceKm * 1.22 - osrmResult.distanceKm) / (osrmResult.distanceKm * 1.22)) * 100),
      }))
    } catch {
      // Fallback: ruta simulada con curvatura de calles
      console.warn('OSRM no disponible, usando ruta simulada')
      const simResult = simulateRoadRoute(waypoints)
      setRouteGeometry(simResult.geometry)
      setRouteSource('simulated')
      setRoute(prev => ({
        ...prev,
        distance: simResult.distanceKm,
        time: simResult.durationMin,
        fuel: Math.round(simResult.distanceKm * 0.4 * 10) / 10,
        co2: Math.round(simResult.distanceKm * 0.4 * 2.68 * 10) / 10,
        savingsPercent: Math.round(((simResult.distanceKm * 1.22 - simResult.distanceKm) / (simResult.distanceKm * 1.22)) * 100),
      }))
    } finally {
      setLoadingRoute(false)
      setMapKey(prev => prev + 1) // forzar re-render del mapa
    }
  }, [reports])

  const handleToggleReport = useCallback((report) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(report.id)) {
        next.delete(report.id)
      } else {
        next.add(report.id)
      }
      return next
    })
  }, [])

  return (
    <div className="app-container">
      {/* Stats bar (compact, scrollable horizontal) */}
      <div className="stats-bar" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--color-accent)',
          whiteSpace: 'nowrap', padding: '0 4px', flexShrink: 0,
        }}>
          🧠 JulIAca
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <StatsCards stats={stats} />
        </div>
      </div>

      {/* Full-screen map */}
      <div className="map-area">
        <MapView
          reports={reports}
          route={route?.orderedPoints || null}
          routeGeometry={routeGeometry}
          onToggleReport={handleToggleReport}
          selectedIds={selectedIds}
          mapKey={mapKey}
        />
      </div>

      {/* Route info card — slides up from bottom */}
      <div className={`route-info-card ${route ? 'route-visible' : ''}`}>
        {route && (
          <>
            <button
              className="route-close-btn"
              onClick={() => { setRoute(null); setRouteGeometry(null); setRouteSource(null) }}
              aria-label="Cerrar ruta"
            >
              <X size={18} />
            </button>
            <div className="route-info-scroll">
              <RoutePanel
                route={route}
                onGenerate={handleGenerateRoute}
                hasReports={reports.length > 0}
                loading={loadingRoute}
                routeSource={routeSource}
              />
            </div>
          </>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="bottom-bar">
        <button
          className="bottom-bar-btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          <span>+ Nuevo Reporte</span>
        </button>
        <button
          className="bottom-bar-btn btn-secondary"
          onClick={handleGenerateRoute}
          disabled={reports.length === 0 || loadingRoute}
        >
          <Truck size={20} />
          <span>🚛 Generar Ruta</span>
        </button>
      </div>

      {/* ReportForm as full-screen modal */}
      {showForm && (
        <div className="form-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowForm(false)
        }}>
          <div className="form-modal-content">
            <button
              className="form-modal-close"
              onClick={() => setShowForm(false)}
              aria-label="Cerrar formulario"
            >
              <X size={24} />
            </button>
            <ReportForm onAddReport={handleAddReport} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
