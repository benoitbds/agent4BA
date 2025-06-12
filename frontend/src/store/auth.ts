import { create } from 'zustand'

interface AuthState {
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  async login(email, password) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    })
    if (res.status === 200) {
      const data = await res.json()
      set({ token: data.access_token })
      localStorage.setItem('token', data.access_token)
    } else {
      throw res
    }
  },
  logout() {
    localStorage.removeItem('token')
    set({ token: null })
  },
}))
