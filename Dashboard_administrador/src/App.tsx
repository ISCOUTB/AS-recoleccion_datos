"use client"

import { useState } from "react"
import "./App.css"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import { BookOpen, Calendar, Home, Users, BarChart3 } from "lucide-react"
import { ThemeProvider } from "./context/ThemeContext"
import DashboardPage from "./pages/DashboardPage"
import UsersPage from "./pages/UsersPage"
import ReportsPage from "./pages/ReportsPage"
import CoursesPage from "./pages/CoursesPage"
import CalendarPage from "./pages/CalendarPage"

function App() {
  const [activeMenu, setActiveMenu] = useState("dashboard")

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "reports", label: "Reportes", icon: BarChart3 },
    { id: "courses", label: "Cursos", icon: BookOpen },
    { id: "schedule", label: "Calendario", icon: Calendar },
  ]

  const renderActivePage = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardPage />
      case "users":
        return <UsersPage />
      case "reports":
        return <ReportsPage />
      case "courses":
        return <CoursesPage />
      case "schedule":
        return <CalendarPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <ThemeProvider>
      <div className="app-container">
        <Sidebar appName="STEM-APP" menuItems={menuItems} activeMenu={activeMenu} onMenuChange={setActiveMenu} />
        <main className="main-content">
          <Header
            userName="Carlos Rodríguez"
            userRole="Administrador"
            avatarUrl="/placeholder.svg?height=40&width=40"
          />
          {renderActivePage()}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
