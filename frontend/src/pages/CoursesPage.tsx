import "./CoursesPage.css"

const CoursesPage = () => {
  return (
    <div className="content-wrapper">
      <h1>Cursos Matriculados</h1>
      <ul className="courses-list">
        <li className="course-item">Matemáticas Avanzadas</li>
        <li className="course-item">Programación Web</li>
        <li className="course-item">Bases de Datos</li>
      </ul>
    </div>
  )
}

export default CoursesPage
