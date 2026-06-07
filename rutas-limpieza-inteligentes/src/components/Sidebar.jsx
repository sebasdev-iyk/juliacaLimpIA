import { NavLink } from 'react-router-dom'

const SIDEBAR_ITEMS = [
  { to: '/admin', icon: 'dashboard', label: 'Panel' },
  { to: '/admin/mapa', icon: 'map', label: 'Mapa' },
  { to: '/admin/personal', icon: 'group', label: 'Personal' },
  { to: '/admin/ajustes', icon: 'settings', label: 'Ajustes' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] flex flex-col bg-white h-full w-80 shadow-xl border-r border-gray-200 transform transition-all duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 pt-8 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-lg">delete</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1D1F] leading-tight">Juliaca LimpIA</h2>
            <p className="text-[11px] text-[#6F767E] font-medium">Gestión Ambiental</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-4 pt-6">
          {SIDEBAR_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#135C3A] text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'text-[#6F767E] hover:bg-gray-50 hover:text-[#1A1D1F]'
                }`
              }
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="text-sm font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="mx-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 text-sm">eco</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1A1D1F]">JulIAca Limp-IA v2.0</p>
              <p className="text-[10px] text-[#6F767E]">YOLO-World + React</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
