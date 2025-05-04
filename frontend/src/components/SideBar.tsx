import { NavLink, useLocation } from "react-router-dom"
import { Home, BookOpen, Clock, Layers } from "lucide-react"
import "../styles/SideBar.css"

const Sidebar = () => {
  const location = useLocation()
  const path = location.pathname

  // Función para determinar si una ruta está activa
  const isActive = (route: string) => {
    if (route === "/dashboard" || route === "/dashboard/") {
      // Para la ruta de inicio, solo debe estar activa cuando estamos exactamente en /dashboard
      return path === "/dashboard" || path === "/dashboard/"
    }
    // Para otras rutas, verificamos si el path comienza con la ruta
    return path.startsWith(route)
  }

  return (
    <aside className="sidebar">
      <div className="logo">STEM-APP</div>
      <nav className="nav-menu">
        <NavLink
          to="/dashboard"
          className={isActive("/dashboard") ? "nav-item active" : "nav-item"}
          end // Esto es importante para que solo coincida exactamente con /dashboard
        >
          <Home size={20} />
          <span>Inicio</span>
        </NavLink>
        <NavLink
          to="/dashboard/academico"
          className={isActive("/dashboard/academico") ? "nav-item active" : "nav-item"}
        >
          <BookOpen size={20} />
          <span>Académico</span>
        </NavLink>
        <NavLink to="/dashboard/horario" className={isActive("/dashboard/horario") ? "nav-item active" : "nav-item"}>
          <Clock size={20} />
          <span>Horario</span>
        </NavLink>
        <NavLink to="/dashboard/cursos" className={isActive("/dashboard/cursos") ? "nav-item active" : "nav-item"}>
          <Layers size={20} />
          <span>Cursos</span>
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
