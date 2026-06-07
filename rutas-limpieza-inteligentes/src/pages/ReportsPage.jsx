import { useReportes } from '../store/reportStore'

const STATUS_STYLES = {
  'Enviado': { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
  'En proceso': { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
  'Resuelto': { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  'Pendiente': { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
}

export default function ReportsPage() {
  const { reports } = useReportes()

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-12 bg-white/80 border-b border-gray-200 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500 bg-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-emerald-600">person</span>
          </div>
          <span className="text-lg font-bold text-emerald-600">JulIAca Limp-IA</span>
        </div>
        <button className="w-12 h-12 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="pt-20 px-6 max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-emerald-700 mb-1">Mis Reportes</h1>
          <p className="text-gray-500 text-sm">Seguimiento de tus contribuciones ciudadanas.</p>
        </header>

        {reports.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">assignment</span>
            <p className="text-gray-500">No tienes reportes aún.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-4 bottom-4 w-0.5" style={{
              background: 'linear-gradient(to bottom, transparent, #bbcabf 15%, #bbcabf 85%, transparent)',
            }} />
            <div className="space-y-6">
              {reports.map((report) => {
                const style = STATUS_STYLES[report.estado] || STATUS_STYLES.Pendiente
                const isResolved = report.estado === 'Resuelto'

                return (
                  <div key={report.id} className="relative pl-12">
                    <div className={`absolute left-4 top-1.5 w-4 h-4 rounded-full ${style.dot} ring-4 ring-white shadow-sm z-10 flex items-center justify-center`}>
                      {report.estado === 'Resuelto' && (
                        <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                      )}
                    </div>
                    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${isResolved ? 'opacity-80' : ''}`}>
                      <div className="flex flex-row">
                        <div className={`w-24 h-24 shrink-0 bg-gray-100 flex items-center justify-center ${isResolved ? 'grayscale-[0.3]' : ''}`}>
                          <span className="material-symbols-outlined text-3xl text-gray-300">photo</span>
                        </div>
                        <div className="p-3 flex flex-col justify-between flex-grow">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-semibold text-gray-900">{report.zona}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${style.badge}`}>
                                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                                {report.estado}
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              {report.fecha}
                            </p>
                            {report.descripcion && (
                              <p className="text-gray-400 text-xs mt-1 truncate">{report.descripcion}</p>
                            )}
                          </div>
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
