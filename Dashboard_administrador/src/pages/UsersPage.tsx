"use client"

import { useState } from "react"
import { Search, UserPlus, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending"
  lastLogin: string
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Ana Martínez",
    email: "ana.martinez@ejemplo.com",
    role: "Estudiante",
    status: "active",
    lastLogin: "Hoy, 10:23 AM",
  },
  {
    id: "2",
    name: "Carlos López",
    email: "carlos.lopez@ejemplo.com",
    role: "Profesor",
    status: "active",
    lastLogin: "Ayer, 3:45 PM",
  },
  {
    id: "3",
    name: "Elena Rodríguez",
    email: "elena.rodriguez@ejemplo.com",
    role: "Administrador",
    status: "active",
    lastLogin: "Hoy, 9:10 AM",
  },
  {
    id: "4",
    name: "Javier Sánchez",
    email: "javier.sanchez@ejemplo.com",
    role: "Estudiante",
    status: "inactive",
    lastLogin: "Hace 2 semanas",
  },
  {
    id: "5",
    name: "María González",
    email: "maria.gonzalez@ejemplo.com",
    role: "Estudiante",
    status: "pending",
    lastLogin: "Nunca",
  },
  {
    id: "6",
    name: "Roberto Fernández",
    email: "roberto.fernandez@ejemplo.com",
    role: "Profesor",
    status: "active",
    lastLogin: "Hoy, 8:30 AM",
  },
]

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleActionClick = (userId: string) => {
    setActionMenuOpen(actionMenuOpen === userId ? null : userId)
  }

  const handleStatusChange = (userId: string, newStatus: "active" | "inactive" | "pending") => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    setActionMenuOpen(null)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
    setActionMenuOpen(null)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "status-active"
      case "inactive":
        return "status-inactive"
      case "pending":
        return "status-pending"
      default:
        return ""
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <button className="primary-button">
          <UserPlus size={16} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <select className="filter-select">
              <option value="all">Todos los roles</option>
              <option value="student">Estudiantes</option>
              <option value="teacher">Profesores</option>
              <option value="admin">Administradores</option>
            </select>
            <select className="filter-select">
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                      {user.status === "active" && "Activo"}
                      {user.status === "inactive" && "Inactivo"}
                      {user.status === "pending" && "Pendiente"}
                    </span>
                  </td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <div className="action-cell">
                      <button className="action-button" onClick={() => handleActionClick(user.id)}>
                        <MoreHorizontal size={16} />
                      </button>

                      {actionMenuOpen === user.id && (
                        <div className="action-menu">
                          <button className="action-menu-item">
                            <Edit size={14} />
                            <span>Editar</span>
                          </button>

                          {user.status !== "active" && (
                            <button className="action-menu-item" onClick={() => handleStatusChange(user.id, "active")}>
                              <UserCheck size={14} />
                              <span>Activar</span>
                            </button>
                          )}

                          {user.status !== "inactive" && (
                            <button
                              className="action-menu-item"
                              onClick={() => handleStatusChange(user.id, "inactive")}
                            >
                              <UserX size={14} />
                              <span>Desactivar</span>
                            </button>
                          )}

                          <button className="action-menu-item delete" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 size={14} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="pagination-button">Anterior</button>
          <div className="pagination-numbers">
            <button className="pagination-number active">1</button>
            <button className="pagination-number">2</button>
            <button className="pagination-number">3</button>
          </div>
          <button className="pagination-button">Siguiente</button>
        </div>
      </div>
    </div>
  )
}

export default UsersPage
