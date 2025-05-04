"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      <span>{theme === "light" ? "Modo oscuro" : "Modo claro"}</span>
    </button>
  )
}
