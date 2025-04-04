import { useState, useRef, useEffect } from "react"
import { Bell, Settings, CheckCircle, AlertCircle, Info, LogOut, User, Moon, Sun, HelpCircle } from "lucide-react"
import "./ProfileHeader.css"

interface Notification {
  id: number
  type: string
  message: string
  time: string
  icon: any
  read?: boolean
}

interface ProfileHeaderProps {
  name: string
  role: string
  avatarUrl: string
}

const ProfileHeader = ({ name, role, avatarUrl }: ProfileHeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "success",
      message: "Calificación registrada: Matemáticas Avanzadas",
      time: "Hace 2 horas",
      icon: CheckCircle,
      read: false
    },
    {
      id: 2,
      type: "warning",
      message: "Recordatorio: Entrega de proyecto final",
      time: "Hace 1 día",
      icon: AlertCircle,
      read: false
    },
    {
      id: 3,
      type: "info",
      message: "Nueva encuesta disponible",
      time: "Hace 2 días",
      icon: Info,
      read: false
    },
  ])

  const notificationsRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Obtener el conteo de notificaciones no leídas
  const unreadCount = notifications.filter(notification => !notification.read).length

  // Cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowSettings(false)
  }

  const toggleSettings = () => {
    setShowSettings(!showSettings)
    setShowNotifications(false)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // Aquí se podría implementar la lógica para cambiar el tema
  }

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })))
  }

  // Función para marcar una notificación específica como leída
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }

  // Función para eliminar todas las notificaciones
  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <header className="profile-header">
      <div className="profile-info">
        <img src={avatarUrl || "/placeholder.svg"} alt="Profile" className="avatar" />
        <div className="user-details">
          <h2>{name}</h2>
          <p>{role}</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="notification-container" ref={notificationsRef}>
          <button
            className={`icon-button ${showNotifications ? "active" : ""}`}
            onClick={toggleNotifications}
            aria-label="Notificaciones"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notifications-menu">
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
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.type} ${notification.read ? 'read' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={`notification-icon ${notification.type}`}>
                        <notification.icon size={18} />
                      </div>
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
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
                    <button 
                      className="text-button text-danger" 
                      onClick={clearAllNotifications}
                    >
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
            className={`icon-button ${showSettings ? "active" : ""}`}
            onClick={toggleSettings}
            aria-label="Configuración"
          >
            <Settings size={20} />
          </button>

          {showSettings && (
            <div className="dropdown-menu settings-menu">
              <div className="dropdown-header">
                <h3>Configuración</h3>
              </div>
              <div className="dropdown-content">
                <button className="menu-item">
                  <User size={18} />
                  <span>Perfil</span>
                </button>
                <button className="menu-item" onClick={toggleDarkMode}>
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{darkMode ? "Modo claro" : "Modo oscuro"}</span>
                </button>
                <button className="menu-item">
                  <HelpCircle size={18} />
                  <span>Ayuda</span>
                </button>
                <div className="menu-divider"></div>
                <button className="menu-item logout">
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