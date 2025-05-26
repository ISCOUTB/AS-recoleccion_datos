"use client"

import type React from "react"

interface ChartsSectionProps {
  studentsData: any[]
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ studentsData }) => {
  // Procesar datos para gráficas
  const programsData = studentsData.reduce((acc, student) => {
    const program = student.registrationData?.program ?? "Sin programa"
    acc[program] = (acc[program] ?? 0) + 1
    return acc
  }, {})

  const sisbenData = studentsData.reduce((acc, student) => {
    const sisben = student.formData?.sisben ?? "No especificado"
    acc[sisben] = (acc[sisben] ?? 0) + 1
    return acc
  }, {})

  const estratoData = studentsData.reduce((acc, student) => {
    const estrato = student.formData?.estrato ?? "No especificado"
    acc[estrato] = (acc[estrato] ?? 0) + 1
    return acc
  }, {})

  const becaData = studentsData.reduce((acc, student) => {
    const beca = student.formData?.beca ?? "No especificado"
    acc[beca] = (acc[beca] ?? 0) + 1
    return acc
  }, {})

  const colors = ["#4F46E5", "#059669", "#DC2626", "#7C3AED", "#EA580C", "#0891B2"]

  const renderBarChart = (data: number, title: string) => {
    const maxValue = Math.max(...Object.values(data))

    return (
      <div className="chart-card">
        <h3 className="chart-title">{title}</h3>
        <div className="bar-chart">
          {Object.entries(data).map(([key, value], index) => (
            <div key={key} className="bar-item">
              <div className="bar-label">{key}</div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    width: `${((value as number) / maxValue) * 100}%`,
                    backgroundColor: colors[index % colors.length],
                  }}
                ></div>
              </div>
              <div className="bar-value">{value as number}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPieChart = (data: any, title: string) => {
    const total = Object.values(data).reduce((sum: number, val) => sum + (val as number), 0)

    return (
      <div className="chart-card">
        <h3 className="chart-title">{title}</h3>
        <div className="pie-chart-container">
          <div className="pie-chart">
            {Object.entries(data).map(([key, value], index) => {
              const percentage = (((value as number) / total) * 100).toFixed(1)
              return (
                <div key={key} className="pie-item">
                  <div className="pie-color" style={{ backgroundColor: colors[index % colors.length] }}></div>
                  <span className="pie-label">
                    {key}: {percentage}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="charts-section">
      <h2 className="section-title">Análisis por Categorías</h2>

      <div className="charts-grid">
        {renderBarChart(programsData, "Estudiantes por Programa")}
        {renderPieChart(sisbenData, "Distribución SISBEN")}
        {renderBarChart(estratoData, "Estudiantes por Estrato")}
        {renderPieChart(becaData, "Tipos de Apoyo Económico")}
      </div>

      {/* Métricas circulares como en la imagen */}
      <div className="circular-metrics">
        <div className="metric-circle">
          <div className="circle-content">
            <div className="circle-value">{studentsData.length}</div>
            <div className="circle-label">Total Estudiantes</div>
          </div>
        </div>

        <div className="metric-circle">
          <div className="circle-content">
            <div className="circle-value">
              {(
                studentsData.reduce((sum, s) => sum + Number.parseFloat(s.formData?.promedio ?? "0"), 0) /
                studentsData.length
              ).toFixed(1)}
            </div>
            <div className="circle-label">Promedio General</div>
          </div>
        </div>

        <div className="metric-circle">
          <div className="circle-content">
            <div className="circle-value">
              {studentsData.filter((s) => s.formData?.beca && s.formData.beca !== "No tengo apoyo económico").length}
            </div>
            <div className="circle-label">Con Beca</div>
          </div>
        </div>

        <div className="metric-circle">
          <div className="circle-content">
            <div className="circle-value">
              {(
                (studentsData.filter((s) => s.formData?.estadoAcademico === "Activo").length / studentsData.length) *
                100
              ).toFixed(1)}
              %
            </div>
            <div className="circle-label">Activos</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartsSection
