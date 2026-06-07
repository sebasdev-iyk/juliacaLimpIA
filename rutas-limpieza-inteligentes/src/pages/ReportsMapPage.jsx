import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useReportes } from '../store/reportStore'

const CENTER = [-15.4911, -70.1331]

const ICONOS = {
  Crítico: L.divIcon({
    html: '<div style="width:24px;height:24px;background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(239,68,68,0.5),0 0 0 4px rgba(239,68,68,0.2);animation:pulse-red 2s infinite;"></div>',
    className: '', iconSize: [24, 24], iconAnchor: [12, 12],
  }),
  Medio: L.divIcon({
    html: '<div style="width:20px;height:20px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(245,158,11,0.4),0 0 0 3px rgba(245,158,11,0.15);"></div>',
    className: '', iconSize: [20, 20], iconAnchor: [10, 10],
  }),
  Bajo: L.divIcon({
    html: '<div style="width:16px;height:16px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(16,185,129,0.4),0 0 0 3px rgba(16,185,129,0.15);"></div>',
    className: '', iconSize: [16, 16], iconAnchor: [8, 8],
  }),
}

const LEVEL_STYLES = {
  Crítico: 'bg-red-50 text-red-700 border-red-200',
  Medio: 'bg-amber-50 text-amber-700 border-amber-200',
  Bajo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function ReportsMapPage() {
  const { reports } = useReportes()

  return (
    <div className="h-screen flex flex-col">
      <header className="relative z-50 flex justify-between items-center px-5 h-16 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-base">map</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Mapa de Reportes</h1>
            <p className="text-[10px] text-gray-400 font-medium">{reports.length} reportes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-200">
            {reports.filter(r => r.nivel === 'Crítico').length} críticos
          </span>
        </div>
      </header>

      <div className="flex-1 relative">
        {reports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gradient-bg-light p-10">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-4 shadow-lg">
              <span className="material-symbols-outlined text-4xl text-emerald-400">map</span>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Sin reportes aún</h2>
            <p className="text-gray-400 text-sm mb-6 text-center max-w-xs">Tus reportes aparecerán en el mapa después de enviarlos.</p>
            <button
              onClick={() => window.location.href = '/ciudadano/camara'}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 active:scale-95 transition-all"
            >
              Reportar ahora
            </button>
          </div>
        ) : (
          <>
            <MapContainer center={CENTER} zoom={13} className="w-full h-full z-0" zoomControl={false}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              />
              {reports.map(r => (
                <Marker key={r.id} position={[r.latitud, r.longitud]} icon={ICONOS[r.nivel] || ICONOS.Bajo}>
                  <Popup>
                    <div className="min-w-[180px] font-sans">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LEVEL_STYLES[r.nivel] || LEVEL_STYLES.Bajo}`}>
                          {r.nivel}
                        </span>
                        <span className="text-xs text-gray-400">{r.estado}</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{r.zona}</p>
                      {r.descripcion && <p className="text-xs text-gray-500 mt-0.5">{r.descripcion}</p>}
                      <p className="text-[10px] text-gray-400 mt-1.5">{r.fecha}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-[1000] glass rounded-2xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-4">
                {[
                  { color: '#ef4444', label: 'Crítico' },
                  { color: '#f59e0b', label: 'Medio' },
                  { color: '#10b981', label: 'Bajo' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: item.color }} />
                    <span className="text-xs font-medium text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zoom controls */}
            <div className="absolute right-4 top-4 flex flex-col gap-2 z-[1000]">
              {['add', 'remove'].map(icon => (
                <button key={icon} className="w-10 h-10 glass rounded-xl flex items-center justify-center text-gray-600 hover:bg-white/30 active:scale-90 transition-all shadow-lg">
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
