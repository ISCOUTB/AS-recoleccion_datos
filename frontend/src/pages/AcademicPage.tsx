import "./AcademicPage.css"

const AcademicPage = () => {
  return (
    <div className="content-wrapper">
      <h1>Académico</h1>
      <div className="academic-section">
        <div className="info-card">
          <h3>Notas</h3>
          <p>Aquí se mostrarán las calificaciones del estudiante.</p>
        </div>
        <div className="info-card">
          <h3>Tareas</h3>
          <p>Aquí se mostrarán las tareas pendientes.</p>
        </div>
        <div className="info-card">
          <h3>Recomendaciones</h3>
          <p>Aquí se mostrarán recomendaciones académicas.</p>
        </div>
      </div>
    </div>
  )
}

export default AcademicPage
