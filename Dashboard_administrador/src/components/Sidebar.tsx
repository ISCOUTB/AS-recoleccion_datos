"use client"

import type { FC } from "react"
import type { LucideIcon } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

interface SidebarProps {
  appName: string
  menuItems: {
    id: string
    label: string
    icon: LucideIcon
  }[]
  activeMenu: string
  onMenuChange: (menuId: string) => void
}

const Sidebar: FC<SidebarProps> = ({ appName, menuItems, activeMenu, onMenuChange }) => {
  const { theme } = useTheme()

  return (
    <aside className={`sidebar ${theme === "light" ? "sidebar-light" : "sidebar-dark"}`}>
      <div className="sidebar-header">
        <h1>{appName}</h1>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeMenu === item.id ? "active" : ""}`}
                onClick={() => onMenuChange(item.id)}
              >
                <item.icon className="nav-icon" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
