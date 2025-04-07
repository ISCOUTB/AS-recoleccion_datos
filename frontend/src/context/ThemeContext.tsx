"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"

type ThemeContextType = {
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Verificar si hay una preferencia guardada en localStorage
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("darkMode")
      return savedTheme ? JSON.parse(savedTheme) : false
    }
    return false
  })

  // Aplicar el tema cuando cambia el modo
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark")
      document.documentElement.classList.add("dark-mode")
    } else {
      document.documentElement.setAttribute("data-theme", "light")
      document.documentElement.classList.remove("dark-mode")
    }

    // Guardar preferencia en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", JSON.stringify(darkMode))
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>{children}</ThemeContext.Provider>
}

// Hook personalizado para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider")
  }
  return context
}
