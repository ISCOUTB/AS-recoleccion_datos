"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import config from "../../config"
import Header from "./Header"
import "../../styles/AdminDashboard.css"
import "../../styles/Adminlayout.css"

interface AdminLayoutProps {
  children: React.ReactNode
}

interface UserData {
  id: number
  full_name: string
  email: string
  avatar_url?: string
  role?: string
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/")
        return
      }

      try {
        const response = await fetch(`${config.apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Error en la respuesta del servidor")

        const data = await response.json()

        if (data.role !== "ADMIN") {
          console.error("El usuario no tiene permisos de administrador")
          navigate("/dashboard")
          return
        }

        setUserData(data)
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        // Para desarrollo, simular usuario admin
        setUserData({
          id: 1,
          full_name: "Administrador del Sistema",
          email: "admin@universidad.edu.co",
          role: "ADMIN",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  // Función para obtener la URL completa de la imagen
  const getFullImageUrl = (url?: string) => {
    if (!url) return "/placeholder.svg?height=40&width=40"

    // Si la URL ya es absoluta o es un placeholder, devolverla tal cual
    if (url.startsWith("http") || url.startsWith("/placeholder")) {
      return url
    }

    // Para rutas que comienzan con /static, usar la URL base sin /api
    if (url.startsWith("/static")) {
      // Extraer la base URL sin /api
      const baseUrl = config.apiUrl.replace(/\/api\/?$/, "")
      return `${baseUrl}${url}`
    }

    // Para otras rutas relativas
    return `${config.apiUrl}${url}`
  }

  if (loading) {
    return <div className="loading-container">Cargando...</div>
  }

  return (
    <div className="app-container">
      {/* Contenido principal */}
      <div className="main-content">
        {/* Header */}
        <Header
          userName={userData?.full_name ?? "Usuario"}
          userRole="Administrador"
          avatarUrl={getFullImageUrl(userData?.avatar_url)}
        ></Header>

        {/* Contenido principal */}
        <main>{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
