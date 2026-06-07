import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-80 transition-all duration-300 min-h-screen pb-24 md:pb-0">
        <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md px-4 h-12 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined text-emerald-600">menu</span>
            </button>
            <h1
              className="text-lg font-bold text-emerald-600 cursor-pointer"
              onClick={() => navigate('/admin')}
            >
              JulIAca Limp-IA
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
              <span className="material-symbols-outlined text-emerald-600">notifications</span>
            </button>
            <div
              className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center cursor-pointer"
              onClick={() => navigate('/')}
              title="Ver mapa original"
            >
              <span className="material-symbols-outlined text-sm text-blue-500">map</span>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
