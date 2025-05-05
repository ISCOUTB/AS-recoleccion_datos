"use client";

import type React from "react";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, BookOpen, BarChart3, LogOut } from "lucide-react";
import config from "../../config";
import "../../styles/AdminLayout.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface UserData {
  id: number;
  full_name: string;
  email: string;
  avatar_url?: string;
  role?: string;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();




  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
    
      try {
        const response = await fetch(`${config.apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        if (!response.ok) throw new Error("Error en la respuesta del servidor");
    
        const data = await response.json();
    
        if (data.role !== "ADMIN") {
          console.error("El usuario no tiene permisos de administrador");
          navigate("/dashboard");
          return;
        }
    
        setUserData(data);
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Función para obtener la URL completa de la imagen
  const getFullImageUrl = (url?: string) => {
    if (!url) return "/placeholder.svg?height=40&width=40";

    // Si la URL ya es absoluta o es un placeholder, devolverla tal cual
    if (url.startsWith("http") || url.startsWith("/placeholder")) {
      return url;
    }

    // Para rutas que comienzan con /static, usar la URL base sin /api
    if (url.startsWith("/static")) {
      // Extraer la base URL sin /api
      const baseUrl = config.apiUrl.replace(/\/api\/?$/, "");
      return `${baseUrl}${url}`;
    }

    // Para otras rutas relativas
    return `${config.apiUrl}${url}`;
  };

  if (loading) {
    return <div className="loading-container">Cargando...</div>;
  }

  return (
    <div className="app-container">
      {/* Sidebar para escritorio */}
      <aside className="sidebar">
        <div className="sidebar-header">STEM-APP</div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                end
              >
                <Home className="nav-icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                end
              >
                <Users className="nav-icon" />
                <span>Usuarios</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/courses"
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                end
              >
                <BookOpen className="nav-icon" />
                <span>Cursos</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/reports"
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                end
              >
                <BarChart3 className="nav-icon" />
                <span>Reportes</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="main-content">
        {/* Header */}
        <header className="main-header">
          <div className="user-profile">
            <img
              src={getFullImageUrl(userData?.avatar_url) || "/placeholder.svg"}
              alt="Avatar"
              className="avatar"
            />
            <div className="user-info">
              <h3>{userData?.full_name}</h3>
              <p>Administrador</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-button" onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
