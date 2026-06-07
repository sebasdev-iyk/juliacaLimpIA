import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useReportes } from '../store/reportStore'

const CENTER = [-15.4911, -70.1331]

const ICONOS = {
  Crítico: L.divIcon({
    html: '<div style="width:24px;height:24px;background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(239,68,68,0.5),0 0 0 4px rgba(239,68,68,0.2);"></div>',
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

const LEVEL_COLORS = {
  Crítico: { dot: 'bg-red-500', bar: 'bg-red-500', text: 'text-red-600' },
  Medio: { dot: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-600' },
  Bajo: { dot: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-600' },
}

export default function ReportsMapPage() {
  const { reports } = useReportes()
  const [selectedId, setSelectedId] = useState(null)
  const [mapKey, setMapKey] = useState(0)

  const handleSelectReport = (r) => {
    setSelectedId(r.id)
    setTimeout(() => setMapKey(k => k + 1), 50)
  }

  const selected = reports.find(r => r.id === selectedId)
  const center = selected ? [selected.latitud, selected.longitud] : CENTER

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header compacto */}
      <header className="relative z-50 flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-sm">map</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Mapa</h1>
            <p className="text-[9px] text-gray-400 font-medium">{reports.length} reportes</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-200">
            {reports.filter(r => r.nivel === 'Crítico').length} críticos
          </span>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-200">
            {reports.filter(r => r.estado === 'Resuelto').length} ok
          </span>
        </div>
      </header>

      {reports.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 gradient-bg-light">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl text-gray-300">map</span>
          </div>
          <h2 className="text-lg font-bold text-gray-700 mb-1">Sin reportes aún</h2>
          <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">Tus reportes aparecerán aquí después de enviarlos.</p>
          <a href="/ciudadano/camara" className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-all text-sm">
            Reportar ahora
          </a>
        </div>
      ) : (
        <>
          {/* MAPA — 45% de la pantalla */}
          <div className="relative" style={{ height: '45vh' }}>
            <MapContainer key={mapKey} center={center} zoom={selected ? 15 : 13} className="w-full h-full z-0" zoomControl={false} scrollWheelZoom={true}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
              {reports.map(r => (
                <Marker key={r.id} position={[r.latitud, r.longitud]} icon={ICONOS[r.nivel] || ICONOS.Bajo}>
                  <Popup>
                    <div className="min-w-[150px] font-sans">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${LEVEL_STYLES[r.nivel] || LEVEL_STYLES.Bajo}`}>{r.nivel}</span>
                        <span className="text-[10px] text-gray-400">{r.estado}</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{r.zona}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{r.fecha}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Leyenda flotante */}
            <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-md flex items-center gap-3">
              {[
                { color: '#ef4444', label: 'C' },
                { color: '#f59e0b', label: 'M' },
                { color: '#10b981', label: 'B' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: item.color }} />
                  <span className="text-[10px] font-medium text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1">
              {['add', 'remove'].map(icon => (
                <button key={icon} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 active:scale-90 transition-all shadow-md">
                  <span className="material-symbols-outlined text-lg">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LISTA DE REPORTES — 55% restante */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tus reportes</h2>
              <span className="text-[10px] font-medium text-gray-400">{reports.length} total</span>
            </div>

            {reports.map(r => {
              const colors = LEVEL_COLORS[r.nivel] || LEVEL_COLORS.Bajo
              const isSelected = selectedId === r.id

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectReport(r)}
                  className={`bg-white rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected ? 'border-emerald-400 shadow-md shadow-emerald-200/50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-stretch">
                    {/* Barra lateral de severidad */}
                    <div className={`w-1.5 shrink-0 ${colors.bar}`} />

                    <div className="flex-1 p-3.5 flex items-center gap-3 min-w-0">
                      {/* Foto thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                        {r.foto ? (
                          <img src={r.foto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg text-gray-300">photo</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{r.zona}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${colors.text} bg-opacity-10 ${
                            r.nivel === 'Crítico' ? 'bg-red-50' : r.nivel === 'Medio' ? 'bg-amber-50' : 'bg-emerald-50'
                          }`}>
                            {r.nivel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {r.fecha}
                          </span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                            r.estado === 'Resuelto' ? 'bg-emerald-50 text-emerald-600' :
                            r.estado === 'En proceso' ? 'bg-blue-50 text-blue-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {r.estado}
                          </span>
                        </div>
                      </div>

                      {/* Flecha */}
                      <span className="material-symbols-outlined text-gray-300 text-lg">chevron_right</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
