"use client"

import type React from "react"
import { useState, useEffect } from "react"

const StudentInfo: React.FC = () => {
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [formAnswers, setFormAnswers] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      try {
        // CARGAR DATOS DEL REGISTRO
        const regDataString = localStorage.getItem("registrationData")
        if (regDataString) {
          const regData = JSON.parse(regDataString)
          setRegistrationData(regData)
          console.log("✅ DATOS DE REGISTRO CARGADOS:", regData)
        }

        // CARGAR DATOS DEL FORMULARIO
        const formDataString = localStorage.getItem("formData")
        if (formDataString) {
          const formData = JSON.parse(formDataString)
          setFormAnswers(formData)
          console.log("✅ DATOS DEL FORMULARIO CARGADOS:", formData)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="loading-container">Cargando información del estudiante...</div>
  }

  if (!registrationData) {
    return (
      <div className="no-data-message">
        <h2>No hay información de registro</h2>
        <p>Por favor, completa el registro primero.</p>
        <button className="nav-button next-button" onClick={() => (window.location.href = "/register")}>
          Ir al Registro
        </button>
      </div>
    )
  }

  const isFormCompleted = localStorage.getItem("formCompleted") === "true"

  // MAPEAR RESPUESTAS DEL FORMULARIO POR ÍNDICE
  const getFormValue = (field: string) => {
    if (!formAnswers) return "No completado"
    return formAnswers[field] ?? "No completado"
  }

  const formatDate = (dateString: string) => {
    if (dateString === "Pendiente completar formulario" || !dateString) {
      return dateString
    }
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="student-info-container">
      {/* Banner de bienvenida */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1 className="welcome-title">¡Bienvenido, {registrationData.full_name.split(" ")[0]}!</h1>
          <p className="welcome-subtitle">Dashboard Académico - {registrationData.program}</p>
        </div>
        <div className="grade-card">
          <div className="grade-label">Promedio</div>
          <div className="grade-value">{getFormValue("promedio")}</div>
        </div>
      </div>

      {/* Alerta si no ha completado el formulario */}
      {!isFormCompleted && (
        <div className="alert-banner">
          <h3>⚠️ Completa tu perfil académico</h3>
          <p>Para acceder a todas las funcionalidades, completa el formulario académico.</p>
          <button className="nav-button next-button" onClick={() => (window.location.href = "/form")}>
            Completar Formulario
          </button>
        </div>
      )}

      {/* Información académica */}
      <div className="academic-info">
        <div className="info-card">
          <div className="card-icon career-icon">🎓</div>
          <div className="card-content">
            <div className="card-title">Programa Académico</div>
            <div className="card-value">{registrationData.program}</div>
            <div className="card-subtitle">
              Semestre {registrationData.semester} • {getFormValue("estadoAcademico")}
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon credits-icon">📚</div>
          <div className="card-content">
            <div className="card-title">Progreso Académico</div>
            <div className="card-value">{getFormValue("creditos")} créditos</div>
            <div className="card-subtitle">ICFES: {getFormValue("puntajeICFES")} puntos</div>
          </div>
        </div>

        <div className="info-card">
          <div className="card-icon period-icon">📅</div>
          <div className="card-content">
            <div className="card-title">Fecha de Ingreso</div>
            <div className="card-value">{formatDate(getFormValue("fechaIngreso"))}</div>
            <div className="card-subtitle">Graduado en {getFormValue("anoGraduacion")}</div>
          </div>
        </div>
      </div>

      {/* Información detallada */}
      <div className="student-details">
        <div className="details-section">
          <h3>Información Personal y Contacto</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Nombre Completo:</span>
              <span className="detail-value">{registrationData.full_name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Código Estudiantil:</span>
              <span className="detail-value">{registrationData.student_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email Institucional:</span>
              <span className="detail-value">{registrationData.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Teléfono:</span>
              <span className="detail-value">{getFormValue("telefono")}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Información Socioeconómica</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Clasificación SISBEN:</span>
              <span className="detail-value">{getFormValue("sisben")}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Estrato Socioeconómico:</span>
              <span className="detail-value">{getFormValue("estrato")}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Apoyo Económico:</span>
              <span className="detail-value">{getFormValue("beca")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen académico */}
      {isFormCompleted && (
        <div className="academic-summary">
          <h3>Resumen Académico</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-content">
                <div className="summary-title">Promedio Ponderado</div>
                <div className="summary-value">{getFormValue("promedio")}/5.0</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📝</div>
              <div className="summary-content">
                <div className="summary-title">Puntaje ICFES</div>
                <div className="summary-value">{getFormValue("puntajeICFES")}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">🎯</div>
              <div className="summary-content">
                <div className="summary-title">Créditos Completados</div>
                <div className="summary-value">{getFormValue("creditos")}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentInfo
