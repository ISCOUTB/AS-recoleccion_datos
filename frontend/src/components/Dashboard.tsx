"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
import "./DashBoard.css"
import Sidebar from "./SideBar"
import ProfileHeader from "./ProfileHeader"
import WelcomeBanner from "./WelcomeBanner"
import AcademicInfo from "./AcademicInfo"
import AcademicSurvey from "./AcademicSurvey"
import AcademicPage from "../pages/AcademicPage"
import SchedulePage from "../pages/SchedulePage"
import CoursesPage from "../pages/CoursesPage"
import NotFound from "../pages/NotFound"

interface UserData {
  id: number
  email: string
  full_name: string
  student_id: string
  program: string
  semester: number
  icfes_score?: number
}

interface AcademicData {
  period: string
  average_score: number
  credits_completed: number
  total_credits: number
  status: string
}

function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [academicData, setAcademicData] = useState<AcademicData | null>(null)
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

        // Obtener datos académicos
        const academicResponse = await axios.get(`${config.apiUrl}/dashboard/academic-record`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAcademicData(academicResponse.data)
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
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <ProfileHeader
          name={userData?.full_name || "Usuario"}
          role="Estudiante"
          avatarUrl="/placeholder.svg?height=50&width=50"
        />
        <Routes>
          <Route
            path="/"
            element={
              <div className="content-wrapper">
                <WelcomeBanner
                  name={userData?.full_name?.split(" ")[0] || "Usuario"}
                  message="Tu progreso académico está en buen camino"
                  average={academicData?.average_score || 0}
                />
                <AcademicInfo
                  career={userData?.program || "No especificado"}
                  semester={`${userData?.semester || 0}° Semestre`}
                  credits={academicData?.credits_completed || 0}
                  totalCredits={academicData?.total_credits || 0}
                  period={academicData?.period || "No especificado"}
                  status={academicData?.status || "No especificado"}
                />
                <AcademicSurvey />
              </div>
            }
          />
          <Route path="/academico" element={<AcademicPage />} />
          <Route path="/horario" element={<SchedulePage />} />
          <Route path="/cursos" element={<CoursesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default Dashboard

