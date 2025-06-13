import LoginForm from './components/LoginForm'
import ProjectsManager from './components/ProjectsManager'
import { useAuthStore } from './store/auth'
import './App.css'

function App() {
  const { token, logout } = useAuthStore()
  return token ? (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-10">
      <button onClick={logout} className="self-end text-sm underline">
        Déconnexion
      </button>
      <ProjectsManager />
    </div>
  ) : (
    <LoginForm />
  )
}

export default App
