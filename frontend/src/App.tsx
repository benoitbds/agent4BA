import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LoginForm from './components/LoginForm'
import { useAuthStore } from './store/auth'
import ProjectListPage from './pages/ProjectListPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import './index.css'

function App() {
  const { token, logout } = useAuthStore()

  if (!token) return <LoginForm />

  return (
    <Layout>
      <button onClick={logout} className="self-end text-sm underline">
        Déconnexion
      </button>
      <Routes>
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Routes>
    </Layout>
  )
}

export default App
