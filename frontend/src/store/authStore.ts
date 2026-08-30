import { create } from 'zustand'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface AuthStore {
  token: string | null
  user: User | null
  setToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,

  setToken: (token: string) => {
    localStorage.setItem('token', token)
    set({ token })
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },

  isAuthenticated: () => {
    return get().token !== null
  },
}))
