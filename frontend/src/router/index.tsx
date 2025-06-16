import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '../components/Layout'
import LoginForm from '../components/LoginForm'
import { useAuthStore } from '../store/auth'
import ProjectListPage from '../pages/ProjectListPage'
import ProjectDetail from '../pages/ProjectDetail'

const ProjectSpecs = lazy(() => import('../pages/ProjectSpecs'))

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

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: '/projects', element: <ProjectListPage /> },
      { path: '/projects/:id', element: <ProjectDetail /> },
      { path: '/projects/:id/specs', element: <ProjectSpecs /> },
    ],
  },
])
