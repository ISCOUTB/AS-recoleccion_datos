"use client"

import type { FC } from "react"
import type { LucideIcon } from "lucide-react"
import { useTheme } from "../Themeprovider"
import { X } from "lucide-react"

interface SidebarProps {
  appName: string
  menuItems: {
    id: string
    label: string
    icon: LucideIcon
  }[]
  activeMenu: string
  onMenuChange: (menuId: string) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const Sidebar: FC<SidebarProps> = ({
  appName,
  menuItems,
  activeMenu,
  onMenuChange,
  mobileOpen = false,
  onMobileClose,
}) => {
  const { theme } = useTheme()

  const handleMenuClick = (menuId: string) => {
    onMenuChange(menuId)
    if (onMobileClose) {
      onMobileClose()
    }
  }

  return (
    <aside
      className={`sidebar ${theme === "light" ? "sidebar-light" : "sidebar-dark"} ${mobileOpen ? "sidebar-mobile-open" : ""}`}
    >
      <div className="sidebar-header">
        <h1>{appName}</h1>
        {mobileOpen && (
          <button className="sidebar-close-button" onClick={onMobileClose}>
            <X size={24} />
          </button>
        )}
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeMenu === item.id ? "active" : ""}`}
                onClick={() => handleMenuClick(item.id)}
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
