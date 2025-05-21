"use client"

import { createContext, useState, useContext, useEffect, useMemo, type ReactNode } from "react"

type ThemeContextType = {
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("darkMode")
      return savedTheme ? JSON.parse(savedTheme) : false
    }
    return false
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark")
      document.documentElement.classList.add("dark-mode")
      document.body.classList.add("dark")
    } else {
      document.documentElement.setAttribute("data-theme", "light")
      document.documentElement.classList.remove("dark-mode")
      document.body.classList.remove("dark")
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", JSON.stringify(darkMode))
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => !prev)
  }

  // ✅ useMemo para evitar recrear el objeto en cada render
  const contextValue = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider")
  }
  return context
}
