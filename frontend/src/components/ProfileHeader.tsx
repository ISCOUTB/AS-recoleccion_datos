"use client"

import { useState, useRef } from "react"
import { Settings, LogOut, User, Moon, Sun, HelpCircle } from "lucide-react"
import "../styles/ProfileHeader.css"
import { useTheme } from "../context/ThemeContext"
import { useNavigate } from "react-router-dom"
import config from "../config"


interface ProfileHeaderProps {
  name: string
  role: string
  avatarUrl: string
}

const ProfileHeader = ({ name, role, avatarUrl }: ProfileHeaderProps) => {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const settingsRef = useRef<HTMLDivElement>(null)

  const toggleSettings = () => {
    setShowSettings(!showSettings)
  }

  // Navegar a la página de perfil
  const goToProfile = () => {
    navigate("/profile")
    setShowSettings(false)
  }

  // Navegar a la página de ayuda
  const goToHelp = () => {
    navigate("/help")
    setShowSettings(false)
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem("token")

    // Cerrar el menú de configuración
    setShowSettings(false)

    // Usar window.location.href para forzar una recarga completa
    window.location.href = "/"
  }

  const getFullImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg?height=150&width=150"

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


  return (
    <header className="profile-header">
      <div className="profile-info">
        <img src={getFullImageUrl(avatarUrl) || "/placeholder.svg"} alt="Profile" className="avatar" />
        <div className="user-details">
          <h2>{name}</h2>
          <p>{role}</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="settings-container" ref={settingsRef}>
          <button
            className={`icon-button ${showSettings ? "active" : ""}`}
            onClick={toggleSettings}
            aria-label="Configuración"
          >
            <Settings size={"1.5em"} color="currentColor" />
          </button>

          {showSettings && (
            <div className="dropdown-menu settings-menu">
              <div className="dropdown-header">
                <h3>Configuración</h3>
              </div>
              <div className="dropdown-content">
                <button className="menu-item" onClick={goToProfile}>
                  <User size={18} />
                  <span>Perfil</span>
                </button>
                <button className="menu-item" onClick={toggleDarkMode}>
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{darkMode ? "Modo claro" : "Modo oscuro"}</span>
                </button>
                <button className="menu-item" onClick={goToHelp}>
                  <HelpCircle size={18} />
                  <span>Ayuda</span>
                </button>
                <div className="menu-divider"></div>
                <button className="menu-item logout" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default ProfileHeader
