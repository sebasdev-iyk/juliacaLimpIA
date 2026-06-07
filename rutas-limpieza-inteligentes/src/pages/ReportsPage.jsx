import { useReportes } from '../store/reportStore'

const STATUS_STYLES = {
  'Enviado': { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  'En proceso': { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Resuelto': { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Pendiente': { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
}

const LEVEL_BADGES = {
  Crítico: 'bg-red-50 text-red-600 border-red-200',
  Medio: 'bg-amber-50 text-amber-600 border-amber-200',
  Bajo: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

export default function ReportsPage() {
  const { reports } = useReportes()

  return (
    <div className="min-h-screen gradient-bg-light pb-24">
      <header className="sticky top-0 z-50 flex justify-between items-center px-5 h-16 bg-white/70 backdrop-blur-xl border-b border-emerald-100/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-base">assignment</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Mis Reportes</h1>
            <p className="text-[10px] text-gray-400 font-medium">{reports.length} contribuciones</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold bg-white/80 text-gray-500 px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            {reports.filter(r => r.estado === 'Resuelto').length} resueltos
          </span>
        </div>
      </header>

      <main className="px-5 pt-6 max-w-2xl mx-auto">
        {reports.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="material-symbols-outlined text-3xl text-gray-300">assignment</span>
            </div>
            <p className="text-gray-500 font-medium">No tienes reportes aún.</p>
            <p className="text-gray-400 text-sm mt-1">Tus reportes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-3 bottom-3 w-0.5 timeline-line" />
            <div className="space-y-4">
              {reports.map((report) => {
                const style = STATUS_STYLES[report.estado] || STATUS_STYLES.Pendiente
                const isResolved = report.estado === 'Resuelto'
                const levelBadge = LEVEL_BADGES[report.nivel] || LEVEL_BADGES.Bajo

                return (
                  <div key={report.id} className="relative pl-14">
                    <div className={`absolute left-3 top-4 w-4 h-4 rounded-full ${style.dot} ring-[5px] ring-white shadow-sm z-10 flex items-center justify-center`}>
                      {isResolved && (
                        <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                      )}
                    </div>
                    <div className={`bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${isResolved ? 'opacity-70' : ''}`}>
                      <div className="flex">
                        <div className={`w-20 h-20 shrink-0 bg-gradient-to-br ${isResolved ? 'from-gray-100 to-gray-50' : 'from-emerald-50 to-teal-50'} flex items-center justify-center`}>
                          <span className="material-symbols-outlined text-2xl text-gray-300">photo</span>
                        </div>
                        <div className="p-3 flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{report.zona}</p>
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {report.fecha}
                              </p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelBadge}`}>
                                {report.nivel}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                                {report.estado}
                              </span>
                            </div>
                          </div>
                          {report.descripcion && (
                            <p className="text-xs text-gray-400 mt-1 truncate">{report.descripcion}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
