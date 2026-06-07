import { useReportes } from '../store/reportStore'

export default function ProfilePage() {
  const { reports } = useReportes()
  const total = reports.length
  const criticos = reports.filter(r => r.nivel === 'Crítico').length
  const resueltos = reports.filter(r => r.estado === 'Resuelto').length

  return (
    <div className="min-h-screen gradient-bg-light pb-24">
      <header className="sticky top-0 z-50 flex justify-between items-center px-5 h-16 bg-white/70 backdrop-blur-xl border-b border-emerald-100/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-base">person</span>
          </div>
          <h1 className="font-bold text-gray-900 text-sm">Perfil</h1>
        </div>
        <button className="w-9 h-9 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center hover:shadow-md transition-all">
          <span className="material-symbols-outlined text-gray-500">settings</span>
        </button>
      </header>

      <main className="px-5 pt-8 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <span className="material-symbols-outlined text-5xl text-white">person</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center border-2 border-emerald-100">
              <span className="material-symbols-outlined text-emerald-500 text-base">edit</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Ciudadano</h2>
          <p className="text-sm text-gray-400 font-medium">Reportante verificad@</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: total, label: 'Reportes', color: 'text-emerald-600', gradient: 'from-emerald-50 to-teal-50' },
            { value: criticos, label: 'Críticos', color: 'text-red-500', gradient: 'from-red-50 to-rose-50' },
            { value: resueltos, label: 'Resueltos', color: 'text-emerald-500', gradient: 'from-emerald-50 to-emerald-50' },
          ].map((item, i) => (
            <div key={i} className={`bg-gradient-to-br ${item.gradient} p-4 rounded-2xl border border-gray-200/60 text-center shadow-sm hover:shadow-md transition-all`}>
              <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Config */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 px-1">Configuración</h3>
          <div className="space-y-2">
            {[
              { icon: 'notifications', label: 'Notificaciones', desc: 'Activado', color: 'text-emerald-500' },
              { icon: 'dark_mode', label: 'Modo oscuro', desc: 'Automático', color: 'text-indigo-500' },
              { icon: 'translate', label: 'Idioma', desc: 'Español', color: 'text-blue-500' },
              { icon: 'shield', label: 'Privacidad', desc: 'Datos protegidos', color: 'text-purple-500' },
              { icon: 'info', label: 'Versión', desc: 'v2.0.0 · JulIAca Limp-IA', color: 'text-gray-500' },
            ].map((item, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/60 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${item.color}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <span className="material-symbols-outlined text-gray-300">chevron_right</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
