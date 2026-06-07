export default function AdminDashboard() {
  const kpis = [
    { label: 'Reportes hoy', value: '124', trend: '+12% vs ayer', icon: 'assessment', color: 'text-emerald-600', border: 'border-l-emerald-500' },
    { label: 'Puntos Críticos', value: '18', trend: 'Monitoreo activo', icon: 'location_on', color: 'text-blue-600', border: 'border-l-blue-500' },
    { label: 'Pendientes ALTA', value: '07', trend: 'Acción inmediata', icon: 'warning', color: 'text-red-600', border: 'border-l-red-500', bg: 'bg-red-50' },
    { label: 'Tiempo promedio', value: '42min', trend: 'Resolución IA', icon: 'schedule', color: 'text-amber-600', border: 'border-l-amber-500' },
  ]

  const DISTRICTS = [
    { name: 'D1', val: 45 }, { name: 'D2', val: 82 }, { name: 'D3', val: 110 },
    { name: 'D4', val: 65 }, { name: 'D5', val: 50 }, { name: 'D6', val: 88 },
    { name: 'D7', val: 32 },
  ]
  const MAX = Math.max(...DISTRICTS.map(d => d.val))

  const alerts = [
    { zona: 'Desborde Sector Norte', desc: 'Esquina Av. Huancané', hora: '14:20 PM' },
    { zona: 'Escombros Ilegales', desc: 'Zona Industrial I', hora: '13:45 PM' },
    { zona: 'Residuos Peligrosos', desc: 'Mercado Central', hora: '12:10 PM' },
  ]

  return (
    <section className="p-6 md:p-10 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold text-gray-900">Resumen Operativo</h2>
          <span className="text-sm text-blue-600 font-semibold">Actualizado hace 2m</span>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 hide-scrollbar">
          {kpis.map((kpi, i) => (
            <div key={i} className={`flex-shrink-0 w-64 p-6 border border-gray-200/30 rounded-2xl shadow-sm hover:shadow-md transition-all border-l-4 ${kpi.border} ${kpi.bg || 'bg-white'}`}>
              <p className="text-sm font-semibold text-gray-500 mb-1">{kpi.label}</p>
              <h3 className={`text-3xl font-extrabold ${kpi.color}`}>{kpi.value}</h3>
              <div className="flex items-center gap-1 mt-2 text-gray-500">
                <span className="material-symbols-outlined text-sm">{kpi.icon}</span>
                <span className="text-xs">{kpi.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white border border-gray-200/30 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Reportes por Distrito (7 días)</h3>
              <p className="text-gray-500 text-sm">Distribución de carga operativa</p>
            </div>
            <select className="bg-white border-none text-sm text-blue-600 focus:ring-0 rounded-lg p-2">
              <option>Semana actual</option>
              <option>Semana previa</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {DISTRICTS.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-full">
                <div
                  className="w-full bg-blue-200 rounded-t-lg hover:brightness-90 transition-all duration-1000"
                  style={{ height: `${(d.val / MAX) * 100}%` }}
                  title={`${d.name}: ${d.val} reportes`}
                />
                <span className="text-xs font-bold text-gray-500">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">campaign</span>
            Alertas Prioritarias
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="bg-white border border-gray-200/30 p-4 rounded-2xl flex gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-gray-300">warning</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">ALTA</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">{alert.hora}</span>
                  </div>
                  <h4 className="text-sm font-semibold mt-1 truncate">{alert.zona}</h4>
                  <p className="text-xs text-gray-500 truncate">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-95">
            Ver todo el historial
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  )
}
