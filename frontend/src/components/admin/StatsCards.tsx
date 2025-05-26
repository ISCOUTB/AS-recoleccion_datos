"use client"

import type React from "react"

interface StatsCardsProps {
  studentsData: any[]
}

const StatsCards: React.FC<StatsCardsProps> = ({ studentsData }) => {
  // Calcular estadísticas
  const totalStudents = studentsData.length
  const activeStudents = studentsData.filter((s) => s.formData?.estadoAcademico === "Activo").length
  const averageGPA =
    studentsData.reduce((sum, s) => sum + Number.parseFloat(s.formData?.promedio ?? "0"), 0) / totalStudents
  const withScholarship = studentsData.filter(
    (s) => s.formData?.beca && s.formData.beca !== "No tengo apoyo económico",
  ).length

  return (
    <div className="stats-container">
      <div className="stats-card">
        <div className="stats-icon" style={{ backgroundColor: "#4F46E5" }}>
          👥
        </div>
        <div className="stats-info">
          <h3>Total Estudiantes</h3>
          <div className="stats-value">{totalStudents}</div>
          <div className="stats-subtitle">Registrados en el sistema</div>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon" style={{ backgroundColor: "#059669" }}>
          ✅
        </div>
        <div className="stats-info">
          <h3>Estudiantes Activos</h3>
          <div className="stats-value">{activeStudents}</div>
          <div className="stats-subtitle">{((activeStudents / totalStudents) * 100).toFixed(1)}% del total</div>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon" style={{ backgroundColor: "#DC2626" }}>
          📊
        </div>
        <div className="stats-info">
          <h3>Promedio General</h3>
          <div className="stats-value">{averageGPA.toFixed(2)}</div>
          <div className="stats-subtitle">Escala de 0.0 a 5.0</div>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-icon" style={{ backgroundColor: "#7C3AED" }}>
          🎓
        </div>
        <div className="stats-info">
          <h3>Con Beca</h3>
          <div className="stats-value">{withScholarship}</div>
          <div className="stats-subtitle">{((withScholarship / totalStudents) * 100).toFixed(1)}% del total</div>
        </div>
      </div>
    </div>
  )
}

export default StatsCards
