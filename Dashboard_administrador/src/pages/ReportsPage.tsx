import { BarChart, LineChart, PieChart, Download, Calendar } from "lucide-react"

const ReportsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reportes y Estadísticas</h1>
        <div className="header-actions">
          <select className="period-select">
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
          <button className="secondary-button">
            <Calendar size={16} />
            <span>Personalizar</span>
          </button>
          <button className="primary-button">
            <Download size={16} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <div className="reports-grid">
        <div className="card">
          <div className="card-header">
            <h2>Usuarios Activos</h2>
            <div className="card-actions">
              <select className="chart-select">
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              <LineChart size={32} />
              <p>Gráfico de línea: Usuarios activos en el tiempo</p>
              <div className="chart-metrics">
                <div className="metric">
                  <span className="metric-value">1,248</span>
                  <span className="metric-label">Total</span>
                </div>
                <div className="metric positive">
                  <span className="metric-value">+12.5%</span>
                  <span className="metric-label">vs. período anterior</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Distribución por Rol</h2>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              <PieChart size={32} />
              <p>Gráfico circular: Distribución de usuarios por rol</p>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: "#4a6cf7" }}></span>
                  <span className="legend-label">Estudiantes (68%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: "#10b981" }}></span>
                  <span className="legend-label">Profesores (22%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: "#f59e0b" }}></span>
                  <span className="legend-label">Administradores (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Actividad por Curso</h2>
          </div>
          <div className="chart-container">
            <div className="chart-placeholder">
              <BarChart size={32} />
              <p>Gráfico de barras: Actividad por curso</p>
              <div className="chart-metrics">
                <div className="metric">
                  <span className="metric-value">89%</span>
                  <span className="metric-label">Tasa de participación promedio</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Resumen de Rendimiento</h2>
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <h3>Cursos Activos</h3>
              <p className="summary-value">64</p>
              <p className="summary-change positive">+4 este mes</p>
            </div>
            <div className="summary-item">
              <h3>Nuevos Usuarios</h3>
              <p className="summary-value">128</p>
              <p className="summary-change positive">+22% vs. mes anterior</p>
            </div>
            <div className="summary-item">
              <h3>Tasa de Finalización</h3>
              <p className="summary-value">76%</p>
              <p className="summary-change negative">-3% vs. mes anterior</p>
            </div>
            <div className="summary-item">
              <h3>Tiempo Promedio</h3>
              <p className="summary-value">4.2h</p>
              <p className="summary-change neutral">Sin cambios</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
