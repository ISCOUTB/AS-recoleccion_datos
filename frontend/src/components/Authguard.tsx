"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        // Si no hay token, redirigir al login
        navigate("/")
        return
      }

      try {
        // Verificar si el token es válido haciendo una petición al endpoint /users/me
        await axios.get(`${config.apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Si la petición es exitosa, el token es válido
        setIsLoading(false)
      } catch (error) {
        // Si hay un error, el token no es válido o ha expirado
        console.error("Error de autenticación:", error)
        localStorage.removeItem("token")
        navigate("/")
      }
    }

    verifyAuth()

    // Agregar un listener para el evento popstate (cuando se usa el botón de retroceso)
    const handlePopState = () => {
      verifyAuth()
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [navigate])

  if (isLoading) {
    return <div className="loading-container">Verificando autenticación...</div>
  }

  return <>{children}</>
}
