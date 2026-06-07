import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/ciudadano', icon: 'home', label: 'Inicio' },
  { to: '/ciudadano/mapa', icon: 'map', label: 'Mapa' },
  { to: '/ciudadano/reportes', icon: 'assignment', label: 'Reportes' },
  { to: '/ciudadano/perfil', icon: 'person', label: 'Perfil' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-2 pb-2 pt-2 bg-white/80 backdrop-blur-xl border-t border-emerald-100/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all duration-200 active:scale-90 ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-gray-400 hover:text-emerald-600'
            }`
          }
        >
          <span className="material-symbols-outlined text-xl">{item.icon}</span>
          <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
