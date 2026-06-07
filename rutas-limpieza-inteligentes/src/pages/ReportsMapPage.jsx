import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useReportes } from '../store/reportStore'

const CENTER = [-15.4911, -70.1331]

const ICONOS = {
  Crítico: L.divIcon({
    html: '<div style="width:22px;height:22px;background:#ba1a1a;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 0 3px rgba(186,26,26,0.3);"></div>',
    className: '', iconSize: [22, 22], iconAnchor: [11, 11],
  }),
  Medio: L.divIcon({
    html: '<div style="width:18px;height:18px;background:#e29100;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 0 2px rgba(226,145,0,0.3);"></div>',
    className: '', iconSize: [18, 18], iconAnchor: [9, 9],
  }),
  Bajo: L.divIcon({
    html: '<div style="width:14px;height:14px;background:#10b981;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 0 2px rgba(16,185,129,0.3);"></div>',
    className: '', iconSize: [14, 14], iconAnchor: [7, 7],
  }),
}

export default function ReportsMapPage() {
  const { reports } = useReportes()

  return (
    <div className="flex flex-col h-screen">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-12 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-emerald-600">person</span>
          </div>
          <span className="text-lg font-bold text-emerald-600">Mis Reportes en el Mapa</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-full">
            {reports.length}
          </span>
        </div>
      </header>

      <div className="flex-1 mt-12 relative">
        {reports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-10">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">map</span>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No hay reportes aún</h2>
            <p className="text-gray-500 mb-6">Tus reportes aparecerán aquí en el mapa.</p>
            <button
              onClick={() => window.location.href = '/ciudadano/camara'}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700"
            >
              Reportar ahora
            </button>
          </div>
        ) : (
          <MapContainer center={CENTER} zoom={13} className="w-full h-full z-0">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {reports.map(r => (
              <Marker
                key={r.id}
                position={[r.latitud, r.longitud]}
                icon={ICONOS[r.nivel] || ICONOS.Bajo}
              >
                <Popup>
                  <div className="min-w-[160px]">
                    <div className="font-semibold text-sm">{r.zona}</div>
                    <p className="text-xs text-gray-500 mb-1">{r.descripcion}</p>
                    <div className="flex gap-2 items-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        r.nivel === 'Crítico' ? 'bg-red-50 text-red-700' :
                        r.nivel === 'Medio' ? 'bg-amber-50 text-amber-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {r.nivel}
                      </span>
                      <span className="text-xs text-gray-400">{r.fecha}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Estado: {r.estado}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  )
}
