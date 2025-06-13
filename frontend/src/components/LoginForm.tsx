import type { FormEvent } from 'react'
import { useState } from 'react'
import { useAuthStore } from '../store/auth'

export default function LoginForm() {
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(false)
    try {
      await login(email, password)
    } catch (err) {
      if (err instanceof Response && err.status === 401) {
        setError(true)
      } else {
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-sm mx-auto py-10">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        className="border p-2"
      />
      {error && <p className="text-red-500 text-sm">Email ou mot de passe incorrect</p>}
      <button
        type="submit"
        disabled={!email || !password || loading}
        className="bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
      >
        Se connecter
      </button>
    </form>
  )
}
