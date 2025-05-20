"use client"

import React, { useState, useRef, useEffect } from "react"
import { Bell, Settings, Users, BookOpen, AlertCircle, LogOut, User, Moon, Sun, HelpCircle } from "lucide-react"
import "../../styles/ProfileHeader.css"
import { useTheme } from "../../context/ThemeContext"
import { useNavigate } from "react-router-dom"
import config from "../../config"

interface Notification {
  id: number
  type: string
  message: string
  time: string
  icon: any
  read?: boolean
}

interface HeaderProps {
  userName: string
  userRole: string
  avatarUrl: string
  onProfileClick?: () => void
  onToggleSidebar?: () => void
  children?: React.ReactNode
}

const Header = ({ userName, userRole, avatarUrl }: HeaderProps) => {
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "success",
      message: "Nuevo usuario registrado",
      time: "Hace 10 minutos",
      icon: Users,
      read: false,
    },
    {
      id: 2,
      type: "warning",
      message: "Curso actualizado",
      time: "Hace 2 horas",
      icon: BookOpen,
      read: false,
    },
    {
      id: 3,
      type: "info",
      message: "Alerta del sistema",
      time: "Ayer",
      icon: AlertCircle,
      read: true,
    },
  ])

  const notificationsRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)

  // Obtener el conteo de notificaciones no leídas
  const unreadCount = notifications.filter((notification) => !notification.read).length

  // Cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Para notificaciones, verificar que el clic no fue en el botón ni en el menú
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }

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

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
    setShowNotifications(!showNotifications)
    setShowSettings(false)
  }

  const toggleSettings = (e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
    setShowSettings(!showSettings)
    setShowNotifications(false)
  }

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  // Función para marcar una notificación específica como leída
  const markAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Función para eliminar todas las notificaciones
  const clearAllNotifications = (e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
    setNotifications([])
  }

  // Navegar a la página de perfil
  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
    navigate("/profile")
    setShowSettings(false)
  }

  // Navegar a la página de ayuda
  const goToHelp = (e: React.MouseEvent) => {
    e.stopPropagation() // Detener la propagación del evento
    navigate("/help")
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

  // Prevenir cierre de menú al hacer clic dentro
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
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
        <div className="notification-container" ref={notificationsRef}>
          <button
            ref={notificationButtonRef}
            className={`icon-button ${showNotifications ? "active" : ""}`}
            onClick={toggleNotifications}
            aria-label="Notificaciones"
          >
            <Bell size={"1.5em"} color="currentColor" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notifications-menu" onClick={handleMenuClick}>
              <div className="dropdown-header">
                <h3>Notificaciones</h3>
                <button
                  className="text-button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  style={{ opacity: unreadCount === 0 ? 0.5 : 1 }}
                >
                  Marcar todas como leídas
                </button>
              </div>
              <div className="dropdown-content">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className={`notification-item ${notification.type} ${notification.read ? "read" : ""}`}
                      onClick={(e) => markAsRead(notification.id, e)}
                    >
                      <div className={`notification-icon ${notification.type}`}>
                        {React.createElement(notification.icon, { size: 18 })}
                      </div>
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="empty-notifications">
                    <p>No tienes notificaciones</p>
                  </div>
                )}
              </div>
              <div className="dropdown-footer">
                {notifications.length > 0 ? (
                  <div className="footer-actions">
                    <button className="text-button">Ver todas</button>
                    <button className="text-button text-danger" onClick={clearAllNotifications}>
                      Borrar todas
                    </button>
                  </div>
                ) : (
                  <button className="text-button">Ver historial</button>
                )}
              </div>
            </div>
          )}
        </div>

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
            <div className="dropdown-menu settings-menu" onClick={handleMenuClick}>
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

export default Header
