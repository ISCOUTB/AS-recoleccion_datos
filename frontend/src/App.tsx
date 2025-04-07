"use client"

import type React from "react"

import { useState, useEffect } from "react"
import "./App.css"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import students from "./assets/students.png"
import Register from "./components/register"
import Dashboard from "./pages/Dashboard"
import Form from "./pages/Form"
import NotFound from "./pages/NotFound"
import axios from "axios"
import config from "./config"
import ProfilePage from "./pages/ProfilePage"
import HelpPage from "./pages/HelpPage"
import { ThemeProvider } from "./context/ThemeContext"

const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Verificar si ya hay una sesión activa
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // Verificar si el token es válido
      const verifyToken = async () => {
        try {
          await axios.get(`${config.apiUrl}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          // Si la petición es exitosa, el token es válido, redirigir al dashboard
          window.location.href = "/dashboard"
        } catch (err) {
          // Si hay un error, el token no es válido, eliminarlo
          localStorage.removeItem("token")
        }
      }
      verifyToken()
    }
  }, [])

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

// Componente mejorado para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        // Verificar si el token es válido haciendo una petición al endpoint /users/me
        await axios.get(`${config.apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Si la petición es exitosa, el token es válido
        setIsAuthenticated(true)
      } catch (error) {
        // Si hay un error, el token no es válido o ha expirado
        console.error("Error de autenticación:", error)
        localStorage.removeItem("token")
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()

    // Agregar un listener para el evento popstate (cuando se usa el botón de retroceso)
    const handlePopState = () => {
      verifyAuth()
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [navigate])

  // Listener para detectar cambios en el localStorage (por ejemplo, cuando se cierra sesión en otra pestaña)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setIsAuthenticated(!!e.newValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  if (isLoading) {
    return <div className="loading-container">Verificando autenticación...</div>
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" />
}

// Componente para detectar cambios en el token y forzar actualización
const AuthListener = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Función para manejar el evento de almacenamiento personalizado
    const handleLogout = () => {
      navigate("/", { replace: true })
    }

    // Agregar un listener para el evento personalizado
    window.addEventListener("app:logout", handleLogout)

    return () => {
      window.removeEventListener("app:logout", handleLogout)
    }
  }, [navigate])

  return null
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)

    // Agregar un listener para detectar cambios en el localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        setIsAuthenticated(!!e.newValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return (
    <ThemeProvider>
      <Router>
        <AuthListener />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
