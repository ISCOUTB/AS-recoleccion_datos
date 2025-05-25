import type React from "react"
import "../styles/StudentInfo.css" 

interface StudentData {
  name: string
  studentId: string
  program: string
  semester: number
  sisben: string
  stratum: number
  weightedAverage: number
  icfesScore: number
  enrollmentDate: string
  academicStatus: string
  credits: {
    completed: number
    total: number
  }
  contact: {
    email: string
    phone: string
  }
}

const StudentInfo: React.FC = () => {
  // Datos estáticos del estudiante
  const studentData: StudentData = {
    name: "Ana María García",
    studentId: "2021234567",
    program: "Ingeniería de Sistemas",
    semester: 6,
    sisben: "C1",
    stratum: 3,
    weightedAverage: 4.2,
    icfesScore: 385,
    enrollmentDate: "2021-02-15",
    academicStatus: "Activo",
    credits: {
      completed: 120,
      total: 160,
    },
    contact: {
      email: "ana.garcia@universidad.edu.co",
      phone: "+57 300 123 4567",
    },
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "activo":
        return "status-active"
      case "inactivo":
        return "status-inactive"
      case "graduado":
        return "status-graduated"
      default:
        return "status-pending"
    }
  }

  const getAverageColor = (average: number) => {
    if (average >= 4.0) return "average-excellent"
    if (average >= 3.5) return "average-good"
    if (average >= 3.0) return "average-regular"
    return "average-low"
  }

  return (
    <div className="student-info-container">
      <div className="info-grid">
        {/* Información Personal */}
        <div className="info-card personal-info">
          <div className="card-header">
            <h3>Información Personal</h3>
            <div className="header-accent"></div>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="label">Nombre Completo:</span>
              <span className="value">{studentData.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Código Estudiantil:</span>
              <span className="value code">{studentData.studentId}</span>
            </div>
            <div className="info-row">
              <span className="label">Email Institucional:</span>
              <span className="value email">{studentData.contact.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Teléfono:</span>
              <span className="value">{studentData.contact.phone}</span>
            </div>
          </div>
        </div>

        {/* Información Académica */}
        <div className="info-card academic-info">
          <div className="card-header">
            <h3>Información Académica</h3>
            <div className="header-accent"></div>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="label">Programa:</span>
              <span className="value">{studentData.program}</span>
            </div>
            <div className="info-row">
              <span className="label">Semestre Actual:</span>
              <span className="value semester">{studentData.semester}°</span>
            </div>
            <div className="info-row">
              <span className="label">Estado Académico:</span>
              <span className={`value status ${getStatusColor(studentData.academicStatus)}`}>
                {studentData.academicStatus}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Fecha de Ingreso:</span>
              <span className="value">{new Date(studentData.enrollmentDate).toLocaleDateString("es-CO")}</span>
            </div>
          </div>
        </div>

        {/* Rendimiento Académico */}
        <div className="info-card performance-info">
          <div className="card-header">
            <h3>Rendimiento Académico</h3>
            <div className="header-accent"></div>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="label">Promedio Ponderado:</span>
              <span className={`value average ${getAverageColor(studentData.weightedAverage)}`}>
                {studentData.weightedAverage.toFixed(2)}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Puntaje ICFES:</span>
              <span className="value icfes">{studentData.icfesScore}</span>
            </div>
            <div className="info-row">
              <span className="label">Créditos Completados:</span>
              <span className="value">
                {studentData.credits.completed} / {studentData.credits.total}
              </span>
            </div>
            <div className="progress-container">
              <div className="progress-label">Progreso del Programa</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(studentData.credits.completed / studentData.credits.total) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {Math.round((studentData.credits.completed / studentData.credits.total) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Información Socioeconómica */}
        <div className="info-card socioeconomic-info">
          <div className="card-header">
            <h3>Información Socioeconómica</h3>
            <div className="header-accent"></div>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="label">Clasificación SISBEN:</span>
              <span className="value sisben">{studentData.sisben}</span>
            </div>
            <div className="info-row">
              <span className="label">Estrato Socioeconómico:</span>
              <span className="value stratum">Estrato {studentData.stratum}</span>
            </div>
            <div className="benefits-section">
              <div className="benefits-title">Beneficios Aplicables:</div>
              <div className="benefits-list">
                <span className="benefit-tag">Descuento Matrícula</span>
                <span className="benefit-tag">Apoyo Alimentario</span>
                <span className="benefit-tag">Transporte Subsidiado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentInfo
