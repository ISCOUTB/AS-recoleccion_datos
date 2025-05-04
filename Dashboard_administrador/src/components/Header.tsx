"use client"

import { type FC, useState } from "react"
import { Bell, Settings, X } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

interface HeaderProps {
  userName: string
  userRole: string
  avatarUrl: string
}

const Header: FC<HeaderProps> = ({ userName, userRole, avatarUrl }) => {
  const [settingsOpen, setSettingsOpen] = useState(false)

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen)
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
        <button className="icon-button notification-btn">
          <Bell />
          <span className="notification-badge">3</span>
        </button>
        <div className="settings-container">
          <button className="icon-button" onClick={toggleSettings}>
            <Settings />
          </button>
          {settingsOpen && (
            <div className="settings-dropdown">
              <div className="settings-dropdown-header">
                <h4>Configuración</h4>
                <button className="close-btn" onClick={toggleSettings}>
                  <X size={18} />
                </button>
              </div>
              <div className="settings-dropdown-content">
                <div className="settings-item">
                  <ThemeToggle />
                </div>
                <div className="settings-item">
                  <button className="settings-button">
                    <span>Perfil</span>
                  </button>
                </div>
                <div className="settings-item">
                  <button className="settings-button">
                    <span>Preferencias</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
