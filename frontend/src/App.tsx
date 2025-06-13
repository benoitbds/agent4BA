import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginForm from './components/LoginForm'
import { useAuthStore } from './store/auth'
import ProjectListPage from './pages/ProjectListPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import './index.css'

function App() {
  const { token, logout } = useAuthStore()

  return (
    <BrowserRouter>
      {token ? (
        <Layout>
          <button onClick={logout} className="self-end text-sm underline">
            Déconnexion
          </button>
          <Routes>
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="*" element={<Navigate to="/projects" />} />
          </Routes>
        </Layout>
      ) : (
        <LoginForm />
      )}
    </BrowserRouter>
  )
}

export default App
