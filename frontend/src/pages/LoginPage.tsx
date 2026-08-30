import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/services'
import { sv } from '../localization/sv'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let response
      if (isLogin) {
        response = await authAPI.login(formData.email, formData.password)
      } else {
        response = await authAPI.register(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        )
      }

      const { token, user } = response.data
      setToken(token)
      setUser(user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || sv.common.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">{sv.auth.title}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder={sv.auth.firstName}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                placeholder={sv.auth.lastName}
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
              />
            </>
          )}

          <input
            type="email"
            placeholder={sv.auth.email}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            required
          />

          <input
            type="password"
            placeholder={sv.auth.password}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? sv.auth.loading : isLogin ? sv.auth.loginButton : sv.auth.registerButton}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {isLogin ? sv.auth.noAccount : sv.auth.hasAccount}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline font-semibold"
          >
            {isLogin ? sv.auth.toggleRegister : sv.auth.toggleLogin}
          </button>
        </p>
      </div>
    </div>
  )
}
