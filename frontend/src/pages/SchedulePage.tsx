import "../styles/SchedulePage.css"

const SchedulePage = () => {
  return (
    <div className="content-wrapper">
      <h1>Horario</h1>
      <div className="schedule-section">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Lunes</th>
              <th>Martes</th>
              <th>Miércoles</th>
              <th>Jueves</th>
              <th>Viernes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>8:00 - 10:00</td>
              <td>Matemáticas</td>
              <td>Física</td>
              <td>Programación</td>
              <td>Química</td>
              <td>Inglés</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SchedulePage
