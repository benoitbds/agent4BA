const BASE_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost'

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${BASE_URL}${path}`, { ...options, headers })
}
