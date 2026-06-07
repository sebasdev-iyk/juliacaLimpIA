import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MapPage from './pages/MapPage'
import HomePage from './pages/HomePage'
import CameraPage from './pages/CameraPage'
import PreviewPage from './pages/PreviewPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import AdminMapPage from './pages/AdminMapPage'
import CitizenLayout from './layouts/CitizenLayout'
import AdminLayout from './layouts/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ORIGINAL MAP — ruta principal, funcionalidad 100% intacta */}
        <Route path="/" element={<MapPage />} />

        {/* Citizen flows (new) */}
        <Route element={<CitizenLayout />}>
          <Route path="/ciudadano" element={<HomePage />} />
          <Route path="/ciudadano/reportes" element={<ReportsPage />} />
          <Route path="/ciudadano/perfil" element={<ProfilePage />} />
        </Route>
        <Route path="/ciudadano/camara" element={<CameraPage />} />
        <Route path="/ciudadano/preview" element={<PreviewPage />} />

        {/* Admin flows (new) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="mapa" element={<AdminMapPage />} />
          <Route path="personal" element={
            <div className="p-10 text-center">
              <div className="material-symbols-outlined text-6xl text-gray-300 mb-4">group</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Gestión de Personal</h2>
              <p className="text-gray-500">Próximamente</p>
            </div>
          } />
          <Route path="ajustes" element={
            <div className="p-10 text-center">
              <div className="material-symbols-outlined text-6xl text-gray-300 mb-4">settings</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Configuración</h2>
              <p className="text-gray-500">Próximamente</p>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
