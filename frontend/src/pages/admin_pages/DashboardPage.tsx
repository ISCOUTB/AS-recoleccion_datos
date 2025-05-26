"use client"

import { useState, useEffect } from "react"
import StatsCards from "../../components/admin/StatsCards"
import ChartsSection from "../../components/admin/ChartsSection"
import StudentsTable from "../../components/admin/StudentsTable"
import "../../styles/AdminCharts.css"

interface StudentData {
  registrationData: any
  formData: any
}

const AdminDashboard = () => {
  const [studentsData, setStudentsData] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStudentsData = () => {
      try {
        // Cargar todos los estudiantes registrados
        const allStudentsString = localStorage.getItem("allStudents")
        let allStudents = []

        if (allStudentsString) {
          allStudents = JSON.parse(allStudentsString)
          console.log("ESTUDIANTES CARGADOS DESDE LOCALSTORAGE:", allStudents)
        }

        // Si no hay estudiantes reales, agregar datos de ejemplo para demostración
        if (allStudents.length === 0) {
          const sampleStudents = [
            {
              id: 1,
              full_name: "Ana García López",
              email: "ana.garcia@universidad.edu.co",
              student_id: "T000123457",
              program: "Ingeniería de Sistemas",
              semester: "3",
              registrationDate: "2024-01-15T10:30:00.000Z",
              formCompleted: true,
              formData: {
                estadoAcademico: "Activo",
                fechaIngreso: "2023-02-15",
                promedio: "4.1",
                puntajeICFES: "345",
                creditos: "45",
                sisben: "B2",
                estrato: "Estrato 3",
                beca: "Beca parcial (solo matrícula)",
                anoGraduacion: "2021",
                telefono: "3001234568",
              },
            },
            {
              id: 2,
              full_name: "Carlos Rodríguez",
              email: "carlos.rodriguez@universidad.edu.co",
              student_id: "T000123458",
              program: "Ingeniería Industrial",
              semester: "5",
              registrationDate: "2024-01-16T14:20:00.000Z",
              formCompleted: true,
              formData: {
                estadoAcademico: "Activo",
                fechaIngreso: "2022-08-20",
                promedio: "3.8",
                puntajeICFES: "320",
                creditos: "78",
                sisben: "C1",
                estrato: "Estrato 2",
                beca: "No tengo apoyo económico",
                anoGraduacion: "2020",
                telefono: "3001234569",
              },
            },
          ]
          allStudents = sampleStudents
        }

        // Convertir al formato esperado por los componentes
        const formattedStudents = allStudents.map((student: any) => ({
          registrationData: {
            full_name: student.full_name,
            email: student.email,
            student_id: student.student_id,
            program: student.program,
            semester: student.semester,
          },
          formData: student.formData ?? {
            estadoAcademico: "Pendiente",
            fechaIngreso: "No completado",
            promedio: "0.0",
            puntajeICFES: "0",
            creditos: "0",
            sisben: "No especificado",
            estrato: "No especificado",
            beca: "No especificado",
            anoGraduacion: "No especificado",
            telefono: "No especificado",
          },
        }))

        setStudentsData(formattedStudents)
        console.log("DATOS FORMATEADOS PARA DASHBOARD:", formattedStudents)
      } catch (error) {
        console.error("Error al cargar datos de estudiantes:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStudentsData()
  }, [])

  if (loading) {
    return <div className="loading-container">Cargando dashboard...</div>
  }

  return (
    <div className="page-container">
      <div className="dashboard-content">
        {/* Tarjeta de bienvenida */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h2>Dashboard de Administración</h2>
            <p>Gestiona y analiza la información de estudiantes registrados</p>
          </div>
          <div className="metric-container">
            <div className="metric">
              <h3>Total Estudiantes</h3>
              <div className="metric-value">{studentsData.length}</div>
            </div>
          </div>
        </div>

        {studentsData.length === 0 ? (
          <div className="no-data-card">
            <h3>No hay estudiantes registrados</h3>
            <p>Cuando los estudiantes se registren y completen sus formularios, aparecerán las estadísticas aquí.</p>
          </div>
        ) : (
          <>
            {/* Tarjetas de estadísticas */}
            <StatsCards studentsData={studentsData} />

            {/* Sección de gráficas */}
            <ChartsSection studentsData={studentsData} />

            {/* Tabla de estudiantes */}
            <StudentsTable studentsData={studentsData} />
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
