import { useAuthStore } from '../store/auth'

export default function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = useAuthStore.getState().token
  const headers = new Headers(init.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(input, { ...init, headers })
}
