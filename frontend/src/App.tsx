"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import students from "./assets/students.png"
import Register from "./components/register"
import Dashboard from "./pages/Dashboard"
import Form from "./pages/Form"
import NotFound from "./pages/NotFound"
import axios from "axios"
import config from "./config"
import ProfilePage from "./pages/ProfilePage"
import HelpPage from "./pages/HelpPage"
import AdminLayout from "./components/admin/tempAdmin"
import AdminDashboard from "./pages/admin_pages/DashboardPage"
import UsersPage from "./pages/admin_pages/UsersPage"
import { ThemeProvider } from "./context/ThemeContext"
import CoursesPage from "./pages/admin_pages/CoursesPage"
import ReportsPage from "./pages/admin_pages/ReportsPage"
import "./styles/ThemeFix.css"

const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
          navigate("/dashboard")
        } catch (err) {
          console.log(err)
          localStorage.removeItem("token")
        }
      }
      verifyToken()
    }
  }, [navigate])

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
      navigate("/dashboard")
    } catch (err: any) {
      console.error("Error de login:", err)
      setError(err.response?.data?.detail ?? "Error al iniciar sesión. Intente nuevamente.")
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
            src={students ?? "/placeholder.svg?height=400&width=400"}
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
const ProtectedRoute = ({
  children,
  requiredRole = null,
}: {
  children: React.ReactNode
  requiredRole?: string | null
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

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
        const response = await axios.get(`${config.apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Si la petición es exitosa, el token es válido
        setIsAuthenticated(true)
        setUserRole(response.data.role)

        // Si el usuario es administrador y está intentando acceder a /dashboard, redirigirlo a /admin
        if (
          response.data.role === "ADMIN" &&
          location.pathname === "/dashboard" &&
          !location.pathname.includes("/admin")
        ) {
          navigate("/admin")
        }
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
  }, [navigate, location.pathname])

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

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Si se requiere un rol específico y el usuario no lo tiene, redirigir al dashboard
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
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
  return (
    <ThemeProvider>
      <Router>
        <AuthListener />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/form"
            element={
              <ProtectedRoute>
                <Form />
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

          {/* Rutas de administrador */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <UsersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <CoursesPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <ReportsPage />
                </AdminLayout>
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
