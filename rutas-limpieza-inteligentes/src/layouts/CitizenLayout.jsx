import { Outlet } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

export default function CitizenLayout() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Outlet />
      <BottomNav />
    </div>
  )
}
