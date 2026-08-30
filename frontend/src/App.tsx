import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ContactsPage from './pages/ContactsPage'
import DealsPage from './pages/DealsPage'
import ActivitiesPage from './pages/ActivitiesPage'
import ReportsPage from './pages/ReportsPage'
import Layout from './components/Layout'

function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {token ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
