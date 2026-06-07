import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/ciudadano', icon: 'home', label: 'Home' },
  { to: '/ciudadano/mapa', icon: 'map', label: 'Mapa' },
  { to: '/ciudadano/reportes', icon: 'assignment', label: 'Reports' },
  { to: '/ciudadano/perfil', icon: 'person', label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white dark:bg-gray-900 rounded-t-xl shadow-[0_-4px_12px_rgba(30,64,175,0.08)] md:hidden">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-transform duration-200 active:scale-90 ${
              isActive
                ? 'bg-emerald-100 text-emerald-800 rounded-full px-5 py-1 scale-90'
                : 'text-gray-500 hover:text-emerald-600'
            }`
          }
        >
          <span className="material-symbols-outlined text-xl">{item.icon}</span>
          <span className="text-[12px] font-semibold">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
