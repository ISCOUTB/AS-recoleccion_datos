"use client"

import type React from "react"

interface StudentsTableProps {
  studentsData: any[]
}

const StudentsTable: React.FC<StudentsTableProps> = ({ studentsData }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Lista de Estudiantes Registrados</h3>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>ID Estudiante</th>
              <th>Programa</th>
              <th>Semestre</th>
              <th>Promedio</th>
              <th>Estado</th>
              <th>SISBEN</th>
              <th>Beca</th>
              <th>Formulario</th>
            </tr>
          </thead>
          <tbody>
            {studentsData.map((student, index) => (
              <tr key={index}>
                <td>{student.registrationData?.full_name || "N/A"}</td>
                <td>{student.registrationData?.student_id || "N/A"}</td>
                <td>{student.registrationData?.program || "N/A"}</td>
                <td>{student.registrationData?.semester || "N/A"}</td>
                <td>{student.formData?.promedio || "N/A"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      student.formData?.estadoAcademico === "Activo" ? "status-active" : "status-inactive"
                    }`}
                  >
                    {student.formData?.estadoAcademico || "N/A"}
                  </span>
                </td>
                <td>{student.formData?.sisben || "N/A"}</td>
                <td>{student.formData?.beca || "N/A"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      student.formData?.estadoAcademico !== "Pendiente" ? "status-active" : "status-inactive"
                    }`}
                  >
                    {student.formData?.estadoAcademico !== "Pendiente" ? "Completado" : "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentsTable
