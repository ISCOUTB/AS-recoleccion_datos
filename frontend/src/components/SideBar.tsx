import { NavLink } from "react-router-dom";
import { Home, BookOpen, Clock, Layers } from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">STEM-APP</div>
      <nav className="nav-menu">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Home size={20} />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/dashboard/academico" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <BookOpen size={20} />
          <span>Académico</span>
        </NavLink>
        <NavLink to="/dashboard/horario" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Clock size={20} />
          <span>Horario</span>
        </NavLink>
        <NavLink to="/dashboard/cursos" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Layers size={20} />
          <span>Cursos</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;