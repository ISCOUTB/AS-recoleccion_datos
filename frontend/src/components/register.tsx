"use client"

import type React from "react"
import { useState } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../App.css"
import "../styles/Form.css"
import students from "../assets/students.png"
import config from "../config"

interface FormData {
  email: string
  full_name: string
  password: string
  confirm_password: string
  student_id: string
  program: string
  semester: string
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    full_name: "",
    password: "",
    confirm_password: "",
    student_id: "",
    program: "",
    semester: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [studentIdValidated, setStudentIdValidated] = useState(false)
  const [validatingStudentId, setValidatingStudentId] = useState(false)

  const navigate = useNavigate()
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/form")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    if (name === "student_id") {
      setStudentIdValidated(false)
    }
  }

  const validateStudentId = async () => {
    if (!formData.student_id.trim()) {
      setErrors({ student_id: "ID de estudiante requerido" })
      return
    }

    setValidatingStudentId(true)
    setErrors({})

    try {
      const response = await axios.post(`${config.apiUrl}/users/check-student-id`, {
        student_id: formData.student_id,
      })

      setStudentIdValidated(true)

      if (response.data.student_data) {
        setFormData((prev) => ({
          ...prev,
          program: response.data.student_data.programa || prev.program,
        }))
      }
    } catch (err: any) {
      console.error("Error validando ID:", err)
      setStudentIdValidated(false)

      if (err.response?.data?.detail) {
        setErrors({ student_id: err.response.data.detail })
      } else {
        setErrors({ student_id: "Error al validar el ID de estudiante" })
      }
    } finally {
      setValidatingStudentId(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!studentIdValidated) {
      newErrors.student_id = "Debe validar el ID de estudiante primero"
    }

    if (!formData.email.endsWith(".edu.co")) {
      newErrors.email = "El correo debe ser institucional (.edu.co)"
    }

    if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos una mayúscula"
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos una minúscula"
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos un número"
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos un carácter especial"
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        semester: formData.semester ? Number.parseInt(formData.semester) : undefined,
      }

      console.log("Enviando datos al backend:", dataToSend)

      const response = await axios.post(`${config.apiUrl}/users/register`, dataToSend)
      if (response.data && response.data.access_token) {
        localStorage.setItem("token", response.data.access_token)
      }
      navigate("/form")

    } catch (err: any) {
      console.error("Error en el registro:", err)

      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          setErrors({ general: err.response.data.detail })
        } else if (Array.isArray(err.response.data.detail)) {
          const validationErrors: Record<string, string> = {}
          err.response.data.detail.forEach((error: any) => {
            validationErrors[error.loc[1]] = error.msg
          })
          setErrors(validationErrors)
        }
      } else {
        setErrors({ general: "Error al registrar usuario. Intente nuevamente." })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container">
        <div className="success-message">
          <h2>¡Registro exitoso!</h2>
          <p>Tu cuenta ha sido creada correctamente. Serás redirigido al formulario en unos segundos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container register-container">
      <div className="left-section">
        <div className="text-container">
          <h1>EarlySTEM</h1>
          <h2>Únete a nuestra comunidad académica</h2>
        </div>
        <div className="illustration-container">
          <img
            src={students ?? "/placeholder.svg?height=400&width=400"}
            alt="Estudiantes colaborando"
            className="illustration"
          />
        </div>
      </div>
      <div className="right-section">
        <div className="form-container">
          {/* Logo visible en móviles */}
          <div className="mobile-logo">
            <h1>EarlySTEM</h1>
            <h2>Únete a nuestra comunidad académica</h2>
          </div>

          <h2 className="form-title">Registro de Usuario</h2>

          {errors.general && <div className="error-message">{errors.general}</div>}

          <form onSubmit={handleSubmit} className="form">
            {/* Nombre completo */}
            <div className="form-group">
              <label htmlFor="full_name" className="label">
                Nombre Completo*
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Nombre Completo"
                value={formData.full_name}
                onChange={handleChange}
                required
                className={`input ${errors.full_name ? "input-error" : ""}`}
              />
              {errors.full_name && <div className="error-text">{errors.full_name}</div>}
            </div>

            {/* Correo institucional */}
            <div className="form-group">
              <label htmlFor="email" className="label">
                Correo Institucional*
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="ejemplo@universidad.edu.co"
                value={formData.email}
                onChange={handleChange}
                required
                className={`input ${errors.email ? "input-error" : ""}`}
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>

            {/* ID de estudiante con validación */}
            <div className="form-group">
              <label htmlFor="student_id" className="label">
                ID de estudiante*
              </label>
              <div className="input-group">
                <input
                  id="student_id"
                  name="student_id"
                  type="text"
                  placeholder="Ej: T000XXXXX"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                  className={`input ${errors.student_id ? "input-error" : studentIdValidated ? "input-success" : ""}`}
                />
                <button
                  type="button"
                  onClick={validateStudentId}
                  disabled={validatingStudentId || !formData.student_id.trim()}
                  className={`validate-button ${studentIdValidated ? "validated" : ""}`}
                >
                  {validatingStudentId ? "Validando..." : studentIdValidated ? "✓ Válido" : "Validar"}
                </button>
              </div>
              {errors.student_id && <div className="error-text">{errors.student_id}</div>}
              {studentIdValidated && <div className="success-text">ID de estudiante válido</div>}
            </div>

            {/* Contraseña */}
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="password" className="label">
                  Contraseña*
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`input ${errors.password ? "input-error" : ""}`}
                />
                {errors.password && <div className="error-text">{errors.password}</div>}
              </div>
              <div className="form-group half">
                <label htmlFor="confirm_password" className="label">
                  Confirmar Contraseña*
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Confirmar Contraseña"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  className={`input ${errors.confirm_password ? "input-error" : ""}`}
                />
                {errors.confirm_password && <div className="error-text">{errors.confirm_password}</div>}
              </div>
            </div>

            {/* Programa y Semestre */}
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="program" className="label">
                  Programa Académico
                </label>
                <input
                  id="program"
                  name="program"
                  type="text"
                  placeholder="Ej: Ingeniería"
                  value={formData.program}
                  onChange={handleChange}
                  className={`input ${errors.program ? "input-error" : ""}`}
                />
                {errors.program && <div className="error-text">{errors.program}</div>}
              </div>
              <div className="form-group half">
                <label htmlFor="semester" className="label">
                  Semestre
                </label>
                <input
                  id="semester"
                  name="semester"
                  type="number"
                  placeholder="Semestre"
                  value={formData.semester}
                  onChange={handleChange}
                  min="1"
                  max="12"
                  className={`input ${errors.semester ? "input-error" : ""}`}
                />
                {errors.semester && <div className="error-text">{errors.semester}</div>}
              </div>
            </div>

            {/* Botón de registro */}
            <button type="submit" className="button" disabled={loading || !studentIdValidated}>
              {loading ? "Procesando..." : "Registrarse"}
            </button>

            <div className="links">
              <p>
                ¿Ya tienes una cuenta?{" "}
                <a href="/" className="link">
                  Inicia sesión
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
