import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import Layout from '../components/Layout'
import LoginForm from '../components/LoginForm'
import { useAuthStore } from '../store/auth'
import { routeConfig } from './helpers'

const ProtectedLayout = () => {
  const { token, logout } = useAuthStore()
  if (!token) {
    return <LoginForm />
  }
  return (
    <Layout>
      <button onClick={logout} className="self-end text-sm underline">
        Déconnexion
      </button>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Outlet />
      </Suspense>
    </Layout>
  )
}

const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: routeConfig,
  },
])

export default function Router() {
  return <RouterProvider router={router} />
}
