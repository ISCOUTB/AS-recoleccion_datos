"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import config from "../config"
import "../styles/DashBoard.css"
import ProfileHeader from "../components/ProfileHeader"
import StudentInfo from "../components/StudentInfo"
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
        // USAR SOLO DATOS LOCALES DEL REGISTRO
        const registrationDataString = localStorage.getItem("registrationData")
        if (registrationDataString) {
          const registrationData = JSON.parse(registrationDataString)
          setUserData({
            id: 1,
            email: registrationData.email,
            full_name: registrationData.full_name,
            student_id: registrationData.student_id,
            program: registrationData.program,
            semester: Number.parseInt(registrationData.semester) || 1,
            avatar_url: "/placeholder.svg?height=150&width=150",
          })
          console.log("DATOS DEL USUARIO CARGADOS:", registrationData)
        } else {
          setError("No hay datos de registro. Por favor regístrate primero.")
        }
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los datos.")
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
                  <StudentInfo />
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
