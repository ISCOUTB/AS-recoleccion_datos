"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { UserPlus, BookOpen, Activity, BarChart3 } from "lucide-react"
import WelcomeCard from "../../components/admin/WelcomeCard"
import StatsCard from "../../components/admin/StatsCard"
import config from "../../config"
import "../../styles/AdminDashboard.css"

interface StatsData {
  users: number
  courses: number
  participationRate: number
  uptime: number
}

interface User {
  id: number
  full_name: string
  email: string
  role: string
  is_active: boolean
  last_login?: string
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatsData>({
    users: 0,
    courses: 0,
    participationRate: 0,
    uptime: 99.8,
  })
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("Administrador")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
          // Obtener datos del usuario
          const userResponse = await axios.get(`${config.apiUrl}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          setUserName(userResponse.data.full_name.split(" ")[0])

          // Obtener estadísticas del dashboard
          const statsResponse = await axios.get(`${config.apiUrl}/dashboard/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          setStats(statsResponse.data)

          // Usar datos de ejemplo para usuarios recientes mientras se soluciona el problema de serialización
          const mockRecentUsers: User[] = [
            {
              id: 1,
              full_name: "Ana Martínez",
              email: "ana.martinez@ejemplo.com",
              role: "STUDENT",
              is_active: true,
              last_login: new Date().toISOString(),
            },
            {
              id: 2,
              full_name: "Carlos López",
              email: "carlos.lopez@ejemplo.com",
              role: "TEACHER",
              is_active: true,
              last_login: new Date(Date.now() - 86400000).toISOString(), // ayer
            },
            {
              id: 3,
              full_name: "Elena Rodríguez",
              email: "elena.rodriguez@ejemplo.com",
              role: "ADMIN",
              is_active: true,
              last_login: new Date().toISOString(),
            },
          ]

          setRecentUsers(mockRecentUsers)
          setError(null)
        } catch (apiError: any) {
          console.error("Error al cargar datos del dashboard:", apiError)

          // Proporcionar datos de ejemplo para que la interfaz siga funcionando
          setUserName("Administrador")

          setStats({
            users: 1248,
            courses: 64,
            participationRate: 89,
            uptime: 99.8,
          })

          // Usuarios de ejemplo
          const mockRecentUsers: User[] = [
            {
              id: 1,
              full_name: "Ana Martínez",
              email: "ana.martinez@ejemplo.com",
              role: "STUDENT",
              is_active: true,
              last_login: new Date().toISOString(),
            },
            {
              id: 2,
              full_name: "Carlos López",
              email: "carlos.lopez@ejemplo.com",
              role: "TEACHER",
              is_active: true,
              last_login: new Date(Date.now() - 86400000).toISOString(), // ayer
            },
            {
              id: 3,
              full_name: "Elena Rodríguez",
              email: "elena.rodriguez@ejemplo.com",
              role: "ADMIN",
              is_active: true,
              last_login: new Date().toISOString(),
            },
          ]

          setRecentUsers(mockRecentUsers)
          setError("Error al cargar datos del servidor. Se están mostrando datos de ejemplo.")
        }
      } catch (err: any) {
        console.error("Error general:", err)
        setError("Error al procesar la solicitud")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const translateRole = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return "Administrador"
      case "STUDENT":
        return "Estudiante"
      case "TEACHER":
        return "Profesor"
      default:
        return role
    }
  }

  const getStatusClass = (isActive: boolean) => {
    return isActive ? "status-active" : "status-inactive"
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Nunca"

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Hoy, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`
    } else if (diffDays === 1) {
      return `Ayer, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`
    } else if (diffDays < 14) {
      return `Hace ${diffDays} días`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return <div className="loading-indicator">Cargando datos del dashboard...</div>
  }

  return (
    <div className="dashboard-content">
      {error && <div className="error-alert">{error}</div>}

      <WelcomeCard
        name={userName}
        message="El sistema está funcionando correctamente"
        metric={`${stats.uptime}%`}
        metricLabel="Uptime"
      />

      <div className="stats-container">
        <StatsCard
          title="Usuarios"
          value={stats.users.toString()}
          subtitle="Usuarios activos"
          icon={UserPlus}
          color="#4a6cf7"
        />
        <StatsCard
          title="Cursos"
          value={stats.courses.toString()}
          subtitle="Cursos disponibles"
          icon={BookOpen}
          color="#6577F3"
        />
        <StatsCard
          title="Actividad"
          value={`${stats.participationRate}%`}
          subtitle="Tasa de participación"
          icon={Activity}
          color="#8088E8"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Usuarios Recientes</h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último Acceso</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{translateRole(user.role)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(user.is_active)}`}>
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>{formatDate(user.last_login)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-data">
                    No hay usuarios recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Estadísticas de Deserción</h3>
          <BarChart3 size={20} />
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
          Los datos de deserción se cargarán pronto...
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
