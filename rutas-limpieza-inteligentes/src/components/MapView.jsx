import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { PUNO_CENTER, START_DISPLAY } from '../data/mockReports'

// Iconos personalizados por nivel
function createIcon(color, size) {
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3), 0 0 0 ${size > 16 ? 3 : 2}px ${color}44;
      transition: transform 0.2s;
    "></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const ICONS = {
  Crítico: createIcon('var(--severity-critico-badge)', 22),
  Medio: createIcon('var(--severity-medio-badge)', 18),
  Bajo: createIcon('var(--severity-bajo-badge)', 14),
}

// Marcador del punto de inicio
const START_ICON = L.divIcon({
  html: `<div style="
    width:28px;height:28px;
    background:var(--color-secondary);
    border-radius:6px;
    border:3px solid white;
    box-shadow:0 2px 10px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;
    color:white;font-size:16px;font-weight:700;
  ">🚛</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

export default function MapView({ reports, route, routeGeometry, onToggleReport, selectedIds, mapKey }) {
  // Usar geometría de OSRM (calles reales) si está disponible
  const hasGeometry = routeGeometry && routeGeometry.length > 1
  const polylinePositions = hasGeometry
    ? routeGeometry
    : (route && route.length > 0
        ? [[START_DISPLAY.lat, START_DISPLAY.lng], ...route.map(p => [p.latitud, p.longitud])]
        : [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        key={mapKey || 'map'}
        center={PUNO_CENTER}
        zoom={14}
        style={{ width: '100%', height: '100%', borderRadius: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* Punto de inicio (Municipalidad) */}
        <Marker position={[START_DISPLAY.lat, START_DISPLAY.lng]} icon={START_ICON}>
          <Popup>
            <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
              <strong>🚛 Municipalidad de Juliaca</strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>Punto de inicio de ruta — JulIAca LimpIA</div>
            </div>
          </Popup>
        </Marker>

        {/* Línea de ruta */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ className: 'route-polyline' }}
            weight={4}
            opacity={0.8}
            dashArray="12, 8"
          />
        )}

        {/* Marcadores de reportes */}
        {reports.map(r => {
          const isSelected = selectedIds?.has(r.id)
          const icon = isSelected
            ? L.divIcon({
                html: `<div style="
                  width:24px;height:24px;
                  background:var(--color-primary, #059669);
                  border-radius:50%;
                  border:3px solid var(--severity-bajo-border, #bbf7d0);
                  box-shadow:0 0 0 4px rgba(5,150,105,0.4);
                  display:flex;align-items:center;justify-content:center;
                  color:white;font-size:13px;font-weight:700;
                ">✓</div>`,
                className: '',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })
            : (ICONS[r.nivel] || ICONS.Bajo)

          return (
            <Marker
              key={r.id}
              position={[r.latitud, r.longitud]}
              icon={icon}
              eventHandlers={{
                click: () => onToggleReport && onToggleReport(r),
              }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{r.zona}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{r.descripcion}</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: r.nivel === 'Crítico' ? 'var(--severity-critico-bg)' : r.nivel === 'Medio' ? 'var(--severity-medio-bg)' : 'var(--severity-bajo-bg)',
                      color: r.nivel === 'Crítico' ? 'var(--severity-critico-text)' : r.nivel === 'Medio' ? 'var(--severity-medio-text)' : 'var(--severity-bajo-text)',
                    }}>
                      {r.nivel}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      🎯 {r.analisis_ia?.confianza || r.confianza}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {r.estado} · {r.fecha}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Leyenda */}
      <div className="map-legend">
        {[
          { color: 'var(--severity-critico-badge)', label: 'Crítico' },
          { color: 'var(--severity-medio-badge)', label: 'Medio' },
          { color: 'var(--severity-bajo-badge)', label: 'Bajo' },
          { color: 'var(--color-secondary)', label: 'Inicio' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: item.color,
            }} />
            <span style={{ color: 'var(--legend-text)' }}>{item.label}</span>
          </div>
        ))}
        {polylinePositions.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 3, background: 'var(--color-primary)', borderRadius: 2 }} />
            <span style={{ color: 'var(--legend-text)' }}>{hasGeometry ? 'Ruta por calles' : 'Ruta (línea recta)'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
