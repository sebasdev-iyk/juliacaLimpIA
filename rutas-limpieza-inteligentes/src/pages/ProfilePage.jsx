export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-12 bg-white/80 border-b border-gray-200 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
            <span className="material-symbols-outlined text-emerald-600 text-xl">person</span>
          </div>
          <h1 className="text-lg font-bold text-emerald-600">Perfil</h1>
        </div>
        <button className="w-12 h-12 flex items-center justify-center text-emerald-600">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="pt-20 px-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 ring-4 ring-white shadow-lg">
            <span className="material-symbols-outlined text-5xl text-emerald-600">person</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Ciudadano</h2>
          <p className="text-gray-500 text-sm">Reportante verificad@</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { value: '12', label: 'Reportes', color: 'text-emerald-600' },
            { value: '3', label: 'Críticos', color: 'text-amber-600' },
            { value: '8', label: 'Resueltos', color: 'text-emerald-600' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200/50 text-center shadow-sm">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-gray-500 text-xs font-bold uppercase">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Configuración</h3>
          {[
            { icon: 'notifications', label: 'Notificaciones', desc: 'Activado' },
            { icon: 'dark_mode', label: 'Modo oscuro', desc: 'Automático' },
            { icon: 'language', label: 'Idioma', desc: 'Español' },
            { icon: 'info', label: 'Acerca de', desc: 'v1.0.0' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200/50 flex items-center gap-4 shadow-sm">
              <span className="material-symbols-outlined text-emerald-600">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <span className="material-symbols-outlined text-gray-300">chevron_right</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
