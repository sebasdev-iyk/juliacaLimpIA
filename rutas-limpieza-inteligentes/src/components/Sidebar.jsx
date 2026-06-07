import { NavLink } from 'react-router-dom'

const SIDEBAR_ITEMS = [
  { to: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/mapa', icon: 'map', label: 'Alert Maps' },
  { to: '/admin/personal', icon: 'group', label: 'Personnel' },
  { to: '/admin/ajustes', icon: 'settings', label: 'Settings' },
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
        className={`fixed inset-y-0 left-0 z-[60] flex flex-col p-4 bg-white dark:bg-gray-800 h-full w-80 rounded-r-xl border-r border-gray-200 shadow-lg transform transition-all duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-4 mb-10 px-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 ring-2 ring-emerald-500">
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-600 leading-tight">Admin Panel</h2>
            <p className="text-gray-500 text-sm font-semibold">Operational View</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {SIDEBAR_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-r-full transition-all duration-300 ease-out ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-bold'
                    : 'text-gray-500 hover:bg-gray-100'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-bold text-emerald-600">JulIAca Limp-IA</p>
          <p className="text-xs text-gray-500 mt-1 italic">Gestión Ambiental con IA</p>
        </div>
      </aside>
    </>
  )
}
