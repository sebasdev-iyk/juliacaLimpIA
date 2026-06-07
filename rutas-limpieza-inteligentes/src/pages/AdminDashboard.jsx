export default function AdminDashboard() {
  const kpis = [
    { label: 'Reportes hoy', value: '124', trend: '+12% vs ayer', icon: 'assessment', gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Puntos Críticos', value: '18', trend: 'Monitoreo activo', icon: 'location_on', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Alta Prioridad', value: '07', trend: 'Acción inmediata', icon: 'warning', gradient: 'from-red-500 to-rose-600' },
    { label: 'Tiempo prom.', value: '42min', trend: 'Resolución IA', icon: 'schedule', gradient: 'from-amber-500 to-orange-500' },
  ]

  const DISTRICTS = [
    { name: 'D1', val: 45 }, { name: 'D2', val: 82 }, { name: 'D3', val: 110 },
    { name: 'D4', val: 65 }, { name: 'D5', val: 50 }, { name: 'D6', val: 88 }, { name: 'D7', val: 32 },
  ]
  const MAX = Math.max(...DISTRICTS.map(d => d.val))

  const alerts = [
    { zona: 'Desborde Sector Norte', dir: 'Esquina Av. Huancané', hora: '14:20', nivel: 'Crítico' },
    { zona: 'Escombros Ilegales', dir: 'Zona Industrial I', hora: '13:45', nivel: 'Crítico' },
    { zona: 'Residuos Peligrosos', dir: 'Mercado Central', hora: '12:10', nivel: 'Crítico' },
    { zona: 'Basura acumulada', dir: 'Parque El Cholo', hora: '11:30', nivel: 'Medio' },
  ]

  return (
    <section className="p-6 md:p-10 space-y-6 gradient-bg-light min-h-screen">
      {/* KPIs */}
      <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar -mx-6 px-6">
        {kpis.map((kpi, i) => (
          <div key={i} className={`flex-shrink-0 w-64 p-5 bg-gradient-to-br ${kpi.gradient} rounded-2xl shadow-lg text-white`}>
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{kpi.label}</p>
              <span className="material-symbols-outlined text-white/60">{kpi.icon}</span>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight">{kpi.value}</h3>
            <div className="flex items-center gap-1 mt-2 text-xs text-white/70">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart */}
        <div className="lg:col-span-8 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Reportes por Distrito</h3>
              <p className="text-xs text-gray-400">Últimos 7 días</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-500 rounded-xl px-3 py-2 focus:ring-0">
              <option>Semana actual</option>
              <option>Semana previa</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {DISTRICTS.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-lg hover:brightness-110 transition-all duration-1000 shadow-sm"
                  style={{ height: `${(d.val / MAX) * 100}%` }}
                />
                <span className="text-[10px] font-bold text-gray-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-red-500">campaign</span>
            <h3 className="text-lg font-bold text-gray-900">Alertas</h3>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200/60 p-4 rounded-2xl flex gap-3 hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-red-400">warning</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      alert.nivel === 'Crítico' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {alert.nivel}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">{alert.hora}</span>
                  </div>
                  <h4 className="text-sm font-bold mt-1 truncate text-gray-900">{alert.zona}</h4>
                  <p className="text-xs text-gray-400 truncate">{alert.dir}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Ver historial completo
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  )
}
