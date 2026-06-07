import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ZONES = [
  'Plaza de Armas de Juliaca', 'Mercado Santa Bárbara', 'Terminal Terrestre',
  'Universidad Andina', 'Av. Circunvalación', 'Zona Industrial',
  'Barrio La Era', 'Cerro Santa Bárbara', 'Salida Cusco',
  'Salida Arequipa', 'Estadio', 'Aeropuerto',
]

const ZONE_COORDS = {
  'Plaza de Armas de Juliaca': { lat: -15.4908, lng: -70.1325 },
  'Mercado Santa Bárbara': { lat: -15.4905, lng: -70.1345 },
  'Terminal Terrestre': { lat: -15.4940, lng: -70.1370 },
  'Universidad Andina': { lat: -15.4870, lng: -70.1200 },
  'Av. Circunvalación': { lat: -15.4920, lng: -70.1280 },
  'Zona Industrial': { lat: -15.4950, lng: -70.1400 },
  'Barrio La Era': { lat: -15.4890, lng: -70.1260 },
  'Cerro Santa Bárbara': { lat: -15.4860, lng: -70.1350 },
  'Salida Cusco': { lat: -15.4850, lng: -70.1150 },
  'Salida Arequipa': { lat: -15.4980, lng: -70.1380 },
  'Estadio': { lat: -15.4880, lng: -70.1300 },
  'Aeropuerto': { lat: -15.4770, lng: -70.1570 },
}

export default function PreviewPage() {
  const navigate = useNavigate()
  const [comment, setComment] = useState('')
  const [zone, setZone] = useState(ZONES[0])
  const [charCount, setCharCount] = useState(0)

  const handleChange = (e) => {
    setComment(e.target.value)
    setCharCount(e.target.value.length)
  }

  const handleSubmit = () => {
    alert('✅ Reporte enviado correctamente')
    navigate('/ciudadano')
  }

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col">
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-12 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <span className="text-lg font-bold text-emerald-600">JulIAca Limp-IA</span>
        </div>
        <button className="text-emerald-600">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </nav>

      <main className="flex-1 mt-12 overflow-y-auto px-4 py-4 flex flex-col gap-6">
        <div className="w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg bg-gray-100 relative">
          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-emerald-300">photo_camera</span>
              <p className="text-gray-500 text-sm mt-2">Foto capturada</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span className="text-sm font-semibold">Ubicación capturada ✓</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-500">Zona del reporte</label>
          <select
            value={zone}
            onChange={e => setZone(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 bg-white text-gray-900 transition-all"
          >
            {ZONES.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-500">¿Quieres agregar algo? (máx 100 caracteres)</label>
          <div className="relative">
            <textarea
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 bg-white text-gray-900 transition-all resize-none h-24"
              maxLength={100}
              value={comment}
              onChange={handleChange}
              placeholder="Ej. Frente a la plaza principal..."
            />
            <div className="absolute bottom-2 right-3 text-gray-400 text-xs font-semibold">{charCount}/100</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-auto mb-20">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl text-lg font-bold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Confirmar
            <span className="material-symbols-outlined">send</span>
          </button>
          <button
            onClick={() => navigate('/ciudadano/camara')}
            className="w-full py-4 border-2 border-emerald-600 text-emerald-600 rounded-xl text-lg font-bold active:bg-emerald-50 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            Retomar
          </button>
        </div>
      </main>
    </div>
  )
}
