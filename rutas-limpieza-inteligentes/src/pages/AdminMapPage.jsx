import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'

const CENTER = [-15.4911, -70.1331]

function createIcon(color, size, pulse = false) {
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3), 0 0 0 ${size > 16 ? 3 : 2}px ${color}44;
      ${pulse ? 'animation:pulse-red 2s infinite ease-in-out;' : ''}
    "></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const PINS = [
  { id: 1, lat: -15.4908, lng: -70.1325, zona: 'Jr. Loreto 452', nivel: 'Crítico', dir: 'Cercado de Juliaca', conf: '98.4%', estado: 'Pendiente' },
  { id: 2, lat: -15.4920, lng: -70.1280, zona: 'Av. Circunvalación', nivel: 'Medio', dir: 'Zona Industrial', conf: '87%', estado: 'Pendiente' },
  { id: 3, lat: -15.4870, lng: -70.1200, zona: 'Universidad Andina', nivel: 'Bajo', dir: 'Barrio Universitario', conf: '76%', estado: 'Pendiente' },
  { id: 4, lat: -15.4940, lng: -70.1370, zona: 'Terminal Terrestre', nivel: 'Medio', dir: 'Av. Principal', conf: '81%', estado: 'Pendiente' },
  { id: 5, lat: -15.4890, lng: -70.1260, zona: 'Barrio La Era', nivel: 'Bajo', dir: 'Esquina', conf: '72%', estado: 'Pendiente' },
]

const ICONS = {
  Crítico: createIcon('#ba1a1a', 22, true),
  Medio: createIcon('#e29100', 18),
  Bajo: createIcon('#10b981', 14),
}

const START_ICON = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#3755c3;border-radius:6px;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;"><span class="material-symbols-outlined text-sm">location_on</span></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

export default function AdminMapPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [routeGenerated, setRouteGenerated] = useState(false)

  const handleMarkerClick = (pin) => {
    setSelected(pin)
    setSheetOpen(true)
  }

  return (
    <div className="relative h-[calc(100vh-48px)] w-full">
      <MapContainer center={CENTER} zoom={14} className="w-full h-full z-0" zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        <Marker position={[-15.4908, -70.1325]} icon={START_ICON}>
          <Popup><div className="text-sm"><strong>Municipalidad de Juliaca</strong></div></Popup>
        </Marker>
        {routeGenerated && (
          <Polyline
            positions={[[-15.4908, -70.1325], [-15.4908, -70.1325], [-15.4920, -70.1280], [-15.4940, -70.1370], [-15.4870, -70.1200], [-15.4890, -70.1260]]}
            pathOptions={{ className: 'route-polyline' }}
            weight={4} opacity={0.8} dashArray="12, 8"
          />
        )}
        {PINS.map(pin => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={ICONS[pin.nivel] || ICONS.Bajo}
            eventHandlers={{ click: () => handleMarkerClick(pin) }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <div className="font-semibold text-sm">{pin.zona}</div>
                <div className="text-xs text-gray-500">{pin.dir}</div>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    pin.nivel === 'Crítico' ? 'bg-red-50 text-red-700' :
                    pin.nivel === 'Medio' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>{pin.nivel}</span>
                  <span className="text-xs text-gray-500">{pin.conf}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute right-4 top-4 flex flex-col gap-2 z-[1000]">
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-95"><span className="material-symbols-outlined">add</span></button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-95"><span className="material-symbols-outlined">remove</span></button>
        <button className="mt-4 w-10 h-10 bg-emerald-600 text-white rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95"><span className="material-symbols-outlined">my_location</span></button>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg text-xs flex flex-wrap gap-3">
        {[
          { color: '#ba1a1a', label: 'Crítico' },
          { color: '#e29100', label: 'Medio' },
          { color: '#10b981', label: 'Bajo' },
          { color: '#3755c3', label: 'Inicio' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
            <span className="text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setRouteGenerated(!routeGenerated)}
        className="fixed right-6 bottom-24 md:bottom-6 z-[1000] px-6 h-14 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined">route</span>
        <span className="text-sm font-bold">{routeGenerated ? 'Limpiar Ruta' : 'Generar Ruta'}</span>
      </button>

      <div className={`fixed bottom-0 left-0 right-0 md:left-auto md:right-4 md:bottom-4 md:max-w-md bg-white z-[1000] rounded-t-3xl md:rounded-3xl shadow-lg border-t md:border border-gray-200/30 overflow-hidden transition-transform duration-400 ${
        sheetOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-[110%]'
      }`}>
        <div className="w-full flex justify-center py-3 md:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        {selected && (
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2 text-xs font-bold ${
                  selected.nivel === 'Crítico' ? 'bg-red-50 text-red-700' :
                  selected.nivel === 'Medio' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  <span className="material-symbols-outlined text-sm">shutter_speed</span>
                  Prioridad IA: {selected.nivel}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{selected.zona}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {selected.dir}
                </p>
              </div>
              <button className="text-gray-300 hover:text-gray-900" onClick={() => setSheetOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/20">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Confianza</p>
                <p className="text-lg font-bold text-gray-900">{selected.conf}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/20">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Estado</p>
                <p className="text-sm font-semibold text-gray-900">{selected.estado}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="flex-grow bg-emerald-600 text-white text-sm font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md">
                <span className="material-symbols-outlined">route</span>
                Asignar Ruta
              </button>
              <button className="w-14 h-14 border-2 border-gray-200 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
