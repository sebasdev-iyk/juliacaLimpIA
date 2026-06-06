import { useState, useCallback } from 'react'
import MapView from '../components/MapView'
import StatsCards from '../components/StatsCards'
import RoutePanel from '../components/RoutePanel'
import { useReports } from '../context/ReportsContext'
import { START_DISPLAY } from '../data/mockReports'
import { generateSmartRoute } from '../utils/routeOptimizer'
import { fetchRouteFromOSRM, simulateRoadRoute } from '../utils/osrmRouter'
import { analyzeImage } from '../services/aiAnalyzer'
import { Truck, X, Brain, Image as ImageIcon } from 'lucide-react'

export default function BasuraPage() {
  const { reports, updateReport } = useReports()
  const log = (msg, data) => console.log(`[${new Date().toLocaleTimeString()}] BasuraPage: ${msg}`, data ?? '')
  log('render', { reportsCount: reports.length })
  log('localStorage raw', localStorage.getItem('juliaca_reports')?.slice(0, 300))

  const [route, setRoute] = useState(null)
  const [routeGeometry, setRouteGeometry] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [routeSource, setRouteSource] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [mapKey, setMapKey] = useState(0)
  const [selectedReport, setSelectedReport] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.nivel === 'Crítico').length,
    distance: route?.distance || 0,
    savings: route?.savingsPercent || 0,
  }

  const handleGenerateRoute = useCallback(async () => {
    if (reports.length === 0) return

    const result = generateSmartRoute(reports)
    setRoute(result)
    setSelectedIds(new Set(result.orderedPoints.map(r => r.id)))
    setLoadingRoute(true)
    setRouteSource(null)
    setRouteGeometry(null)

    const waypoints = [
      { lat: START_DISPLAY.lat, lng: START_DISPLAY.lng },
      ...result.orderedPoints.map(p => ({ lat: p.latitud, lng: p.longitud })),
    ]

    try {
      const osrmResult = await fetchRouteFromOSRM(waypoints)
      setRouteGeometry(osrmResult.geometry)
      setRouteSource('osrm')
      setRoute(prev => ({
        ...prev,
        distance: osrmResult.distanceKm,
        time: osrmResult.durationMin,
        fuel: Math.round(osrmResult.distanceKm * 0.4 * 10) / 10,
        co2: Math.round(osrmResult.distanceKm * 0.4 * 2.68 * 10) / 10,
        savingsPercent: Math.round(((osrmResult.distanceKm * 1.22 - osrmResult.distanceKm) / (osrmResult.distanceKm * 1.22)) * 100),
      }))
    } catch {
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
      setMapKey(prev => prev + 1)
    }
  }, [reports])

  const handleToggleReport = useCallback((report) => {
    log('toggle report', { id: report.id, nivel: report.nivel, lat: report.latitud })
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(report.id)) next.delete(report.id)
      else next.add(report.id)
      return next
    })
    setSelectedReport(report)
    setAnalysisResult(report.nivel !== 'Pendiente' ? report : null)
  }, [])

  const handleProcessImage = async () => {
    if (!selectedReport?.imagen_b64) return
    setAnalyzing(true)
    setAnalysisResult(null)

    const blob = await (await fetch(selectedReport.imagen_b64)).blob()
    const file = new File([blob], 'report.jpg', { type: 'image/jpeg' })

    const result = await analyzeImage(file, null)
    setAnalysisResult(result)
    updateReport(selectedReport.id, {
      nivel: result.nivel,
      confianza: result.confianza,
      prioridad: result.prioridad,
      objetos: result.objetos,
      metodo: result.metodo,
    })
    setAnalyzing(false)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="stats-bar" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--color-accent)',
          whiteSpace: 'nowrap', padding: '0 4px', flexShrink: 0,
        }}>
          JulIAca
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <StatsCards stats={stats} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <MapView
              reports={reports}
              route={route?.orderedPoints || null}
              routeGeometry={routeGeometry}
              onToggleReport={handleToggleReport}
              selectedIds={selectedIds}
              mapKey={mapKey}
            />
          </div>

          <div className={`route-info-card ${route ? 'route-visible' : ''}`} style={{ position: 'absolute', zIndex: 500 }}>
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
        </div>

        {selectedReport && (
          <div style={{
            width: 340, flexShrink: 0, borderLeft: '1px solid var(--border-color)',
            background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Reporte</span>
              <button
                onClick={() => { setSelectedReport(null); setAnalysisResult(null) }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {selectedReport.imagen_b64 ? (
                <div style={{
                  borderRadius: 10, overflow: 'hidden', marginBottom: 12,
                  border: '1px solid var(--border-color)',
                }}>
                  <img
                    src={selectedReport.imagen_b64}
                    alt="reporte"
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              ) : (
                <div style={{
                  height: 160, borderRadius: 10, marginBottom: 12,
                  background: 'var(--report-image-upload-bg)',
                  border: '2px dashed var(--report-image-upload-border)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 6, color: 'var(--text-muted)',
                }}>
                  <ImageIcon size={32} />
                  <span style={{ fontSize: 12 }}>Sin imagen</span>
                </div>
              )}

              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
                {selectedReport.descripcion}
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                {selectedReport.latitud.toFixed(4)}, {selectedReport.longitud.toFixed(4)}
              </div>

              <div style={{
                display: 'flex', gap: 6, marginBottom: 12,
                padding: '8px 12px', borderRadius: 8,
                background: selectedReport.nivel === 'Crítico' ? 'var(--severity-critico-bg)' : selectedReport.nivel === 'Medio' ? 'var(--severity-medio-bg)' : selectedReport.nivel === 'Bajo' ? 'var(--severity-bajo-bg)' : 'var(--bg-hover)',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Estado:</span>
                <span style={{
                  padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                  background: selectedReport.nivel === 'Crítico' ? 'var(--severity-critico-badge)' : selectedReport.nivel === 'Medio' ? 'var(--severity-medio-badge)' : selectedReport.nivel === 'Bajo' ? 'var(--severity-bajo-badge)' : 'var(--text-muted)',
                  color: 'white',
                }}>{selectedReport.nivel}</span>
              </div>

              {selectedReport.nivel === 'Pendiente' && selectedReport.imagen_b64 && (
                <button
                  onClick={handleProcessImage}
                  disabled={analyzing}
                  style={{
                    width: '100%', height: 44, borderRadius: 10, border: 'none',
                    background: analyzing ? 'var(--disabled-bg)' : 'var(--color-primary)',
                    color: analyzing ? 'var(--disabled-text)' : 'white',
                    fontSize: 13, fontWeight: 600, cursor: analyzing ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {analyzing ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid var(--disabled-text)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      Procesar con IA
                    </>
                  )}
                </button>
              )}

              {analysisResult && (
                <div style={{
                  marginTop: 12, padding: 12, borderRadius: 10,
                  background: analysisResult.nivel === 'Crítico' ? 'var(--severity-critico-bg)' : analysisResult.nivel === 'Medio' ? 'var(--severity-medio-bg)' : 'var(--severity-bajo-bg)',
                  border: `1px solid ${analysisResult.nivel === 'Crítico' ? 'var(--severity-critico-border)' : analysisResult.nivel === 'Medio' ? 'var(--severity-medio-border)' : 'var(--severity-bajo-border)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Resultado IA</span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: analysisResult.nivel === 'Crítico' ? 'var(--severity-critico-badge)' : analysisResult.nivel === 'Medio' ? 'var(--severity-medio-badge)' : 'var(--severity-bajo-badge)',
                      color: 'white',
                    }}>{analysisResult.nivel}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {analysisResult.resumen}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Confianza: {analysisResult.confianza} · {analysisResult.metodo}
                  </div>
                  {analysisResult.objetos?.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        Objetos detectados:
                      </div>
                      {analysisResult.objetos.map((obj, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', fontSize: 12,
                          padding: '4px 8px', borderRadius: 4,
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.4)' : 'transparent',
                        }}>
                          <span>{obj.clase}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{(obj.confianza * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bottom-bar">
        <button
          className="bottom-bar-btn btn-secondary"
          onClick={handleGenerateRoute}
          disabled={reports.length === 0 || loadingRoute}
        >
          <Truck size={20} />
          <span>Generar Ruta</span>
        </button>
      </div>
    </div>
  )
}
