import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { sv } from '../localization/sv'

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const navItems = [
    { path: '/', label: sv.nav.dashboard, icon: '📊' },
    { path: '/contacts', label: sv.nav.contacts, icon: '👥' },
    { path: '/deals', label: sv.nav.deals, icon: '💼' },
    { path: '/activities', label: sv.nav.activities, icon: '✓' },
    { path: '/reports', label: sv.nav.reports, icon: '📈' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">CRM</h1>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition ${
                location.pathname === item.path ? 'bg-blue-50 border-r-4 border-blue-600' : ''
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 w-64 border-t p-4">
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            {sv.nav.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
