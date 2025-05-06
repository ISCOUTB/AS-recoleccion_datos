"use client"

import type React from "react"

import { type FC, useState, useRef, useEffect } from "react"
import { Bell, Settings, Users, BookOpen, AlertCircle, LogOut, User, Moon, Sun, HelpCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"

interface HeaderProps {
  userName: string
  userRole: string
  avatarUrl: string
  onProfileClick: () => void
  onToggleSidebar: () => void
  children?: React.ReactNode
}

const Header: FC<HeaderProps> = ({ userName, userRole, avatarUrl }) => {
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()

  // Referencias para detectar clics fuera de los dropdowns
  const settingsRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdowns al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verificamos si el clic fue dentro de los menús o sus botones
      const isNotificationButton = (event.target as Element)?.closest(".notification-btn")
      const isSettingsButton = (event.target as Element)?.closest(".settings-btn")

      if (settingsRef.current && !settingsRef.current.contains(event.target as Node) && !isSettingsButton) {
        setSettingsOpen(false)
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        !isNotificationButton
      ) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleSettings = (e: React.MouseEvent) => {
    e.preventDefault() // Previene el comportamiento predeterminado
    e.stopPropagation() // Detiene la propagación del evento
    setSettingsOpen(!settingsOpen)
    if (notificationsOpen) setNotificationsOpen(false)
  }

  const toggleNotifications = (e: React.MouseEvent) => {
    e.preventDefault() // Previene el comportamiento predeterminado
    e.stopPropagation() // Detiene la propagación del evento
    setNotificationsOpen(!notificationsOpen)
    if (settingsOpen) setSettingsOpen(false)
  }

  // Evitar que los clics dentro del menú lo cierren
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Navegar a la página de perfil
  const goToProfile = (e: React.MouseEvent) => {
    e.preventDefault() // Previene el comportamiento predeterminado
    e.stopPropagation()
    navigate("/profile")
    setSettingsOpen(false)
  }

  // Navegar a la página de ayuda
  const goToHelp = (e: React.MouseEvent) => {
    e.preventDefault() // Previene el comportamiento predeterminado
    e.stopPropagation()
    navigate("/help")
    setSettingsOpen(false)
  }

  // Función para alternar el modo oscuro
  const handleToggleDarkMode = (e: React.MouseEvent) => {
    e.preventDefault() // Previene el comportamiento predeterminado
    e.stopPropagation()
    toggleDarkMode()
  }

  // Función para cerrar sesión
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault() // Previene el comportamiento predeterminado
    e.stopPropagation()
    // Eliminar el token del localStorage
    localStorage.removeItem("token")

    // Cerrar el menú de configuración
    setSettingsOpen(false)

    // Usar window.location.href para forzar una recarga completa
    window.location.href = "/"
  }

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault() // Previene el comportamiento predeterminado
    e.stopPropagation() // Detiene la propagación del evento
    // Aquí implementarías la lógica para marcar las notificaciones como leídas
    console.log("Marcando todas las notificaciones como leídas")
  }

  return (
    <header className="main-header">
      <div className="user-profile">
        <img src={avatarUrl || "/placeholder.svg"} alt="Avatar" className="avatar" />
        <div className="user-info">
          <h3>{userName}</h3>
          <p>{userRole}</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="notifications-container" ref={notificationsRef}>
          <button
            className={`icon-button notification-btn ${notificationsOpen ? "active" : ""}`}
            onClick={toggleNotifications}
            aria-label="Notificaciones"
          >
            <Bell />
            <span className="notification-badge">3</span>
          </button>
          {notificationsOpen && (
            <div className="dropdown-menu notifications-dropdown" onClick={handleMenuClick}>
              <div className="dropdown-header">
                <h4>Notificaciones</h4>
                <button className="text-button" onClick={markAllAsRead}>
                  Marcar todas como leídas
                </button>
              </div>
              <div className="dropdown-content">
                <div className="notification-item unread" onClick={(e) => e.stopPropagation()}>
                  <div className="notification-icon">
                    <Users size={16} />
                  </div>
                  <div className="notification-content">
                    <p className="notification-text">
                      <strong>Nuevo usuario registrado</strong>
                    </p>
                    <p className="notification-desc">María González se ha unido a la plataforma</p>
                    <span className="notification-time">Hace 10 minutos</span>
                  </div>
                </div>
                <div className="notification-item unread" onClick={(e) => e.stopPropagation()}>
                  <div className="notification-icon">
                    <BookOpen size={16} />
                  </div>
                  <div className="notification-content">
                    <p className="notification-text">
                      <strong>Curso actualizado</strong>
                    </p>
                    <p className="notification-desc">El curso "Diseño UX/UI" ha sido actualizado</p>
                    <span className="notification-time">Hace 2 horas</span>
                  </div>
                </div>
                <div className="notification-item" onClick={(e) => e.stopPropagation()}>
                  <div className="notification-icon">
                    <AlertCircle size={16} />
                  </div>
                  <div className="notification-content">
                    <p className="notification-text">
                      <strong>Alerta del sistema</strong>
                    </p>
                    <p className="notification-desc">Se ha completado el respaldo automático</p>
                    <span className="notification-time">Ayer</span>
                  </div>
                </div>
              </div>
              <div className="dropdown-footer">
                <div className="footer-actions">
                  <button className="text-button" onClick={(e) => e.stopPropagation()}>
                    Ver todas
                  </button>
                  <button className="text-button text-danger" onClick={(e) => e.stopPropagation()}>
                    Borrar todas
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="settings-container" ref={settingsRef}>
          <button
            className={`icon-button settings-btn ${settingsOpen ? "active" : ""}`}
            onClick={toggleSettings}
            aria-label="Configuración"
          >
            <Settings />
          </button>
          {settingsOpen && (
            <div className="dropdown-menu settings-dropdown" onClick={handleMenuClick}>
              <div className="dropdown-header">
                <h4>Configuración</h4>
              </div>
              <div className="dropdown-content">
                <button className="menu-item" onClick={goToProfile}>
                  <User size={18} />
                  <span>Perfil</span>
                </button>
                <button className="menu-item" onClick={handleToggleDarkMode}>
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

export default Header
