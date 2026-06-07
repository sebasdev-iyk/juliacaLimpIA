import { useNavigate } from 'react-router-dom'
import { useReportes } from '../store/reportStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { reports } = useReportes()
  const activos = reports.filter(r => r.estado !== 'Resuelto').length
  const resueltos = reports.filter(r => r.estado === 'Resuelto').length

  return (
    <div className="min-h-screen gradient-bg-light relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl float" />
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl float float-delay-1" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-400/15 rounded-full blur-3xl float float-delay-2" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-5 h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="material-symbols-outlined text-white text-lg">eco</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">JulIAca</h1>
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest -mt-0.5">Limp-IA</p>
          </div>
        </div>
        <button className="w-11 h-11 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-90">
          <span className="material-symbols-outlined text-emerald-600">notifications</span>
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-4 pb-28">
        {/* Privacy badge */}
        <div className="mb-6 animate-fade-in">
          <div className="bg-white/60 backdrop-blur-md border border-emerald-200/50 px-5 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-emerald-500 text-lg">verified_user</span>
            <p className="text-xs font-semibold text-gray-500">Reporte anónimo · Tus datos seguros</p>
          </div>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-6">
            {/* Glow rings */}
            <div className="absolute -inset-8 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-full opacity-30 blur-2xl animate-pulse" />
            <div className="absolute -inset-4 bg-emerald-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />

            <button
              onClick={() => navigate('/ciudadano/camara')}
              className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white flex flex-col items-center justify-center gap-4 shadow-2xl shadow-emerald-600/40 hover:shadow-emerald-500/60 transition-all duration-500 active:scale-95 group glow-pulse"
            >
              <div className="bg-white/20 p-5 rounded-full group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <span className="material-symbols-outlined text-6xl sm:text-7xl">photo_camera</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight drop-shadow-lg">
                REPORTAR<br />BASURA
              </span>
              <div className="absolute bottom-4 right-4 w-6 h-6 bg-white/30 rounded-full shimmer" />
            </button>
          </div>
          <p className="max-w-xs text-sm text-gray-500 font-medium leading-relaxed">
            Captura una foto de los residuos y nuestra{' '}
            <span className="text-emerald-600 font-bold">IA</span> analizará y priorizará tu reporte automáticamente.
          </p>
        </div>

        {/* Stats + Map link */}
        <div className="w-full max-w-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-emerald-100/50 flex flex-col items-center shadow-sm hover:shadow-md transition-all">
              <span className="text-2xl font-extrabold text-amber-500">{activos}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activos</span>
            </div>
            <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-emerald-100/50 flex flex-col items-center shadow-sm hover:shadow-md transition-all">
              <span className="text-2xl font-extrabold text-emerald-500">{resueltos}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resueltos</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/ciudadano/mapa')}
            className="w-full py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:shadow-lg hover:border-emerald-200 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-emerald-500">map</span>
            Ver reportes en el mapa
          </button>
        </div>
      </main>
    </div>
  )
}
