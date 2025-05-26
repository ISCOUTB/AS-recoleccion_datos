"use client"

import React, { useState, useRef, useEffect } from "react"
import { Settings, LogOut, User, Moon, Sun } from "lucide-react"
import "../../styles/ProfileHeader.css"
import { useTheme } from "../../context/ThemeContext"
import { useNavigate } from "react-router-dom"
import config from "../../config"

interface HeaderProps {
  userName: string
  userRole: string
  avatarUrl: string
}

const Header = ({ userName, userRole, avatarUrl }: HeaderProps) => {
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()

  const settingsRef = useRef<HTMLDivElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)


  // Cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Para configuraciones, verificar que el clic no fue en el botón ni en el menú
      if (
        showSettings &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications, showSettings])

  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
    setShowSettings(!showSettings)
    setShowNotifications(false)
  }


  // Navegar a la página de perfil
  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
    navigate("/profile")
    setShowSettings(false)
  }

  // Función para cerrar sesión
  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
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
    <header className="main-header">
      <div className="user-profile">
        <img src={getFullImageUrl(avatarUrl) || "/placeholder.svg"} alt="Avatar" className="avatar" />
        <div className="user-info">
          <h3>{userName}</h3>
          <p>{userRole}</p>
        </div>
      </div>
      <div className="header-actions">
       

        <div className="settings-container" ref={settingsRef}>
          <button
            ref={settingsButtonRef}
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

export default Header
