import { Routes, Route } from 'react-router-dom'
import UserPage from './pages/UserPage'
import BasuraPage from './pages/BasuraPage'
import { ReportsProvider } from './context/ReportsContext'
import './styles.css'

export default function App() {
  return (
    <ReportsProvider>
      <div className="app-container">
        <Routes>
          <Route path="/user" element={<UserPage />} />
          <Route path="/basura" element={<BasuraPage />} />
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </div>
    </ReportsProvider>
  )
}

function DefaultRedirect() {
  const { pathname } = window.location
  if (pathname === '/') window.location.href = '/user'
  return null
}
