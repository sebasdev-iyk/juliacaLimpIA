import { useNavigate } from 'react-router-dom'
import { useReportes } from '../store/reportStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { reports } = useReportes()
  const activos = reports.filter(r => r.estado !== 'Resuelto').length
  const resueltos = reports.filter(r => r.estado === 'Resuelto').length

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-12 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
            <span className="material-symbols-outlined text-emerald-600">person</span>
          </div>
          <h1 className="text-lg font-bold text-emerald-600">JulIAca Limp-IA</h1>
        </div>
        <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-emerald-50 transition-colors">
          <span className="material-symbols-outlined text-emerald-600">notifications</span>
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center relative px-6 pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <div className="absolute inset-0" style={{
            backgroundColor: '#f8f9ff',
            backgroundImage: 'radial-gradient(#bbcabf 0.5px, transparent 0.5px), radial-gradient(#bbcabf 0.5px, #f8f9ff 0.5px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }} />
        </div>

        <div className="z-10 mb-8 animate-fade-in">
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200 px-6 py-2 rounded-full flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-emerald-600 text-lg">lock</span>
            <p className="text-sm font-semibold text-gray-500">Tu reporte es anónimo. No guardamos tu identidad.</p>
          </div>
        </div>

        <div className="z-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
            <div className="absolute inset-0 bg-emerald-400/10 rounded-full report-pulse" />
            <button
              className="relative w-48 h-48 sm:w-56 sm:h-56 bg-emerald-600 text-white rounded-full flex flex-col items-center justify-center gap-4 shadow-xl hover:bg-emerald-700 transition-all active:scale-90 duration-200 group"
              onClick={() => navigate('/ciudadano/camara')}
            >
              <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-6xl sm:text-7xl">photo_camera</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                REPORTAR<br />BASURA
              </span>
            </button>
          </div>
          <p className="max-w-[280px] text-base text-gray-500 font-medium">
            Captura una foto de la acumulación de residuos y nuestra{' '}
            <span className="text-emerald-600 font-bold">IA</span> se encargará del resto.
          </p>
        </div>

        <div className="z-10 mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200/50 flex flex-col items-center justify-center shadow-sm">
            <span className="text-amber-600 text-2xl font-bold">{activos}</span>
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Activos</span>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200/50 flex flex-col items-center justify-center shadow-sm">
            <span className="text-emerald-600 text-2xl font-bold">{resueltos}</span>
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Limpios hoy</span>
          </div>
        </div>

        {/* Map link */}
        <button
          onClick={() => navigate('/ciudadano/mapa')}
          className="z-10 mt-6 px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-2 text-sm font-semibold text-gray-600 hover:shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-emerald-600">map</span>
          Ver mis reportes en el mapa
        </button>
      </main>
    </div>
  )
}
