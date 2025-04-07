import type React from "react"

import { useState, useEffect } from "react"
import "./App.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import students from "./assets/students.png"
import Register from "./components/register"
import Dashboard from "./pages/Dashboard"
import Form from "./pages/Form"
import NotFound from "./pages/NotFound"
import axios from "axios"
import config from "./config"
import ProfilePage from "./pages/ProfilePage"
import HelpPage from "./pages/HelpPage"
import { ThemeProvider } from "./context/ThemeContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await axios.post(`${config.apiUrl}/users/login`, {
        email,
        password,
      })

      localStorage.setItem("token", response.data.access_token)
      window.location.href = "/dashboard"
    } catch (err: any) {
      console.error("Error de login:", err)
      setError(err.response?.data?.detail || "Error al iniciar sesión. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container login-container">
      <div className="left-section">
        <div className="text-container">
          <h1>SCIENCE STEM</h1>
          <h2>Un impulso más para seguir adelante</h2>
        </div>
        <div className="illustration-container">
          <img
            src={students || "/placeholder.svg?height=400&width=400"}
            alt="Estudiantes colaborando"
            className="illustration"
          />
        </div>
      </div>

      <div className="right-section">
        <div className="form-container">
          {/* Logo visible en móviles */}
          <div className="mobile-logo">
            <h1>SCIENCE STEM</h1>
            <h2>Un impulso más para seguir adelante</h2>
          </div>

          <h2 className="form-title">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="form login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email" className="label">
                Correo Institucional
              </label>
              <input
                id="email"
                type="email"
                placeholder="Correo Institucional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            <button type="submit" className="button" disabled={loading}>
              {loading ? "Procesando..." : "Ingresar"}
            </button>

            <div className="links">
              <a href="/forgot-password" className="link">
                ¿Olvidaste tu contraseña?
              </a>
              <a href="/register" className="link">
                Regístrate
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
    
  )
  
}

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  if (isAuthenticated === null) {
    // Aún verificando autenticación
    return <div>Cargando...</div>
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" />
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/form"
          element={
            <ProtectedRoute>
              <Form />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </Router>
    </ThemeProvider>
  )
}

export default App

