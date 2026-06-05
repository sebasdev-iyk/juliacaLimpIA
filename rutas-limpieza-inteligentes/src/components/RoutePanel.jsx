import { Route, Clock, MapPin, Leaf, TrendingDown, Truck, Loader2, Wifi, WifiOff } from 'lucide-react'

export default function RoutePanel({ route, onGenerate, hasReports, loading, routeSource }) {
  // Estado de carga mientras OSRM calcula la ruta
  if (loading) {
    return (
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        }}>
          <Route size={16} color="var(--color-primary)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Ruta inteligente</span>
        </div>
        <div className="route-loading-state">
          <Loader2 size={24} style={{ margin: '0 auto 8px', color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4 }}>
            Calculando ruta por calles reales...
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Consultando OpenStreetMap Routing Machine (OSRM)
          </p>
          <div className="route-loading-bar">
            <div className="route-loading-bar-fill" />
          </div>
        </div>
      </div>
    )
  }

  if (!route) {
    return (
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        }}>
          <Route size={16} color="var(--color-primary)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Ruta inteligente</span>
        </div>
        <div className="route-empty-state">
          <div style={{ fontSize: 24, marginBottom: 6 }}>🗺️</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Agrega reportes al mapa y genera una ruta optimizada
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            La ruta prioriza:<br />
            🔴 Críticos → 🟡 Medios → 🟢 Bajos<br />
            <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>🛣️ Sigue calles reales con OSRM</span>
          </p>
          <button
            onClick={onGenerate}
            disabled={!hasReports}
            className="route-generate-btn"
          >
            🚛 Generar Ruta Inteligente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="route-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Route size={16} color="var(--color-primary)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Ruta generada</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {routeSource === 'osrm' ? (
            <span className="route-source-badge route-source-osrm">
              <Wifi size={9} /> Calles reales
            </span>
          ) : routeSource === 'simulated' ? (
            <span className="route-source-badge route-source-sim">
              <WifiOff size={9} /> Simulado
            </span>
          ) : null}
          <span className="route-status-badge">Activa</span>
        </div>
      </div>

      {/* Métricas */}
      <div className="route-metrics">
        {[
          { icon: Clock, label: 'Tiempo', value: `${route.time} min` },
          { icon: MapPin, label: 'Distancia', value: `${route.distance} km` },
          { icon: TrendingDown, label: 'Ahorro', value: `${route.savingsPercent}%` },
          { icon: Leaf, label: 'CO₂ evitado', value: `${route.co2} kg` },
        ].map(m => (
          <div key={m.label} className="route-metric-card">
            <div style={{ fontSize: 10, color: 'var(--metric-text)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
              <m.icon size={11} /> {m.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--metric-value)' }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Orden de paradas */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
          📍 Orden de atención ({route.orderedPoints.length} paradas)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Punto de inicio */}
          <div className="route-stop route-stop-start">
            <Truck size={12} color="var(--color-secondary)" />
            <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--text-primary)' }}>Municipalidad de Juliaca</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: 11 }}>Inicio</span>
          </div>

          {route.orderedPoints.map((p, i) => (
            <div
              key={p.id}
              className={`route-stop route-stop-${p.nivel.toLowerCase()}`}
            >
              <span className="route-stop-number">{i + 1}</span>
              <span className="route-stop-name">{p.zona}</span>
              <span className={`route-stop-badge route-stop-badge-${p.nivel.toLowerCase()}`}>
                {p.nivel}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="route-summary">
        <strong>🚛 Resumen:</strong> {route.orderedPoints.length} puntos · {route.distance} km · ~{route.time} min · {route.savingsPercent}% más eficiente que ruta fija
      </div>
    </div>
  )
}
