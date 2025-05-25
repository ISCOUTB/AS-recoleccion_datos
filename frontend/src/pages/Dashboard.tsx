"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
import "../styles/DashBoard.css"
import ProfileHeader from "../components/ProfileHeader"
import NotFound from "../pages/NotFound"
import { ThemeProvider } from "../context/ThemeContext"
const getFullImageUrl = (url: string) => {
  if (!url) return "/placeholder.svg?height=150&width=150"

  if (url.startsWith("http") || url.startsWith("/placeholder")) {
    return url
  }

  if (url.startsWith("/static")) {
    const baseUrl = config.apiUrl.replace(/\/api\/?$/, "")
    return `${baseUrl}${url}`
  }

  return `${config.apiUrl}${url}`
}
interface UserData {
  id: number
  email: string
  full_name: string
  student_id: string
  program: string
  semester: number
  avatar_url?: string 
  icfes_score?: number
}



function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/")
          return
        }

        // Obtener datos del usuario
        const userResponse = await axios.get(`${config.apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUserData(userResponse.data)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("No se pudieron cargar los datos. Por favor, intenta nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  if (loading) {
    return <div className="loading-container">Cargando...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <ThemeProvider>
      <div className="app-container">
        <main className="main-content">
          <ProfileHeader
            name={userData?.full_name ?? "Usuario"}
            role="Estudiante"
            avatarUrl={getFullImageUrl(userData?.avatar_url ?? "/placeholder.svg")}
          />
          <Routes>
            <Route
              path="/"
              element={
                <div className="content-wrapper">
                  
                </div>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default Dashboard
