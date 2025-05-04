"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import config from "../../config";
import "../../styles/UsersPage.css";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  student_id?: string;
  program?: string;
  semester?: number;
}

interface UserFormData {
  full_name: string;
  email: string;
  role: string;
  password?: string;
  confirm_password?: string;
  student_id?: string;
  program?: string;
  semester?: number;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<UserFormData>({
    full_name: "",
    email: "",
    role: "STUDENT",
    password: "",
    confirm_password: "",
    student_id: "",
    program: "",
    semester: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cargar usuarios desde la API
  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Construir parámetros de consulta
      const params: any = {
        skip: (currentPage - 1) * 10,
        limit: 10,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter === "active";
      }

      try {
        // Construir URL con parámetros de consulta
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, value as string);
        });

        const response = await fetch(
          `${config.apiUrl}/users/users?${queryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUsers(data.items || []);
          setTotalPages(data.pages || 1);
          setError(null);
        } else {
          throw new Error("Error en la respuesta del servidor");
        }
      } catch (apiError: any) {
        console.error("Error al cargar usuarios:", apiError);
      }
    } catch (err: any) {
      console.error("Error general:", err);
      setError("Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (userId: number) => {
    setActionMenuOpen(actionMenuOpen === userId ? null : userId);
  };

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${config.apiUrl}/users/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (response.ok) {
        // Actualizar la lista de usuarios
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, is_active: isActive } : user
          )
        );
        setActionMenuOpen(null);
      } else {
        throw new Error("Error al cambiar estado del usuario");
      }
    } catch (err: any) {
      console.error("Error al cambiar estado del usuario:", err);
      setError("Error al cambiar estado del usuario");
    }
  };
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.full_name.trim()) {
      errors.full_name = "El nombre completo es obligatorio.";
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[\w-.]+@[\w-]+\.(edu\.co)$/.test(formData.email)) {
      errors.email = "El correo debe ser institucional (*.edu.co).";
    }

    if (!formData.role) {
      errors.role = "El rol es obligatorio.";
    }

    if (
      modalMode === "add" &&
      (!formData.password || formData.password.length < 8)
    ) {
      errors.password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (modalMode === "add" && !/[A-Z]/.test(formData.password!)) {
      errors.password = "La contraseña debe tener al menos una mayúscula.";
    } else if (modalMode === "add" && !/[0-9]/.test(formData.password!)) {
      errors.password = "La contraseña debe tener al menos un número.";
    } else if (
      modalMode === "add" &&
      !/[^A-Za-z0-9]/.test(formData.password!)
    ) {
      errors.password =
        "La contraseña debe tener al menos un carácter especial.";
    }

    if (formData.role === "STUDENT") {
      if (!formData.student_id?.trim()) {
        errors.student_id =
          "El ID de estudiante es obligatorio para estudiantes.";
      }
      if (!formData.program?.trim()) {
        errors.program = "El programa es obligatorio para estudiantes.";
      }
      if (
        formData.semester &&
        (formData.semester < 1 || formData.semester > 12)
      ) {
        errors.semester = "El semestre debe estar entre 1 y 12.";
      }
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${config.apiUrl}/users/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Eliminar el usuario de la lista
        setUsers(users.filter((user) => user.id !== userId));
        setActionMenuOpen(null);
      } else {
        throw new Error("Error al eliminar usuario");
      }
    } catch (err: any) {
      console.error("Error al eliminar usuario:", err);
      setError("Error al eliminar usuario");
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    setFormData({
      full_name: "",
      email: "",
      role: "STUDENT",
      password: "",
      student_id: "",
      program: "",
      semester: 1,
    });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      student_id: user.student_id || "",
      program: user.program || "",
      semester: user.semester || 1,
    });
    setShowModal(true);
    setActionMenuOpen(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "semester" ? Number.parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (modalMode === "add") {
        // Crear nuevo usuario
        const response = await fetch(`${config.apiUrl}/users/register`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          // Añadir el nuevo usuario a la lista
          setUsers([data, ...users]);
        } else {
          throw new Error("Error al crear usuario");
        }
      } else if (modalMode === "edit" && selectedUser) {
        // Actualizar usuario existente
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password; // No enviar contraseña vacía
        }

        const response = await fetch(
          `${config.apiUrl}/users/users/${selectedUser.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToUpdate),
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Actualizar el usuario en la lista
          setUsers(
            users.map((user) => (user.id === selectedUser.id ? data : user))
          );
        } else {
          throw new Error("Error al actualizar usuario");
        }
      }

      setShowModal(false);
      setError(null);
    } catch (err: any) {
      console.error("Error al guardar usuario:", err);
      setError("Error al guardar usuario");
    }
  };

  const translateRole = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "STUDENT":
        return "Estudiante";
      case "TEACHER":
        return "Profesor";
      default:
        return role;
    }
  };

  const getStatusClass = (isActive: boolean) => {
    return isActive ? "status-active" : "status-inactive";
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return "Nunca";

    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Hoy, ${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`;
    } else if (diffDays === 1) {
      return `Ayer, ${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`;
    } else if (diffDays < 14) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <button className="primary-button" onClick={openAddModal}>
          <UserPlus size={16} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {error && (
        <div
          className={`error-alert ${
            error.includes("serialización") ? "warning-alert" : ""
          }`}
        >
          {error}
          {error.includes("serialización") && (
            <div className="error-details">
              <p>
                Este error se debe a un problema en el backend al serializar
                objetos User. Para solucionarlo:
              </p>
              <ol>
                <li>
                  Verifica que estés utilizando esquemas Pydantic para la
                  respuesta de la API
                </li>
                <li>
                  Asegúrate de convertir los modelos SQLAlchemy a diccionarios o
                  esquemas Pydantic antes de devolverlos
                </li>
                <li>Revisa la ruta /api/users/users en tu backend</li>
              </ol>
            </div>
          )}
        </div>
      )}

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
            <select
              className="filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="STUDENT">Estudiantes</option>
              <option value="TEACHER">Profesores</option>
              <option value="ADMIN">Administradores</option>
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-indicator">Cargando usuarios...</div>
          ) : (
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
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>{translateRole(user.role)}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            user.is_active
                          )}`}
                        >
                          {user.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>{formatLastLogin(user.last_login)}</td>
                      <td>
                        <div className="action-cell">
                          <button
                            className="action-button"
                            onClick={() => handleActionClick(user.id)}
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {actionMenuOpen === user.id && (
                            <div className="action-menu">
                              <button
                                className="action-menu-item"
                                onClick={() => openEditModal(user)}
                              >
                                <Edit size={14} />
                                <span>Editar</span>
                              </button>

                              {!user.is_active && (
                                <button
                                  className="action-menu-item"
                                  onClick={() =>
                                    handleStatusChange(user.id, true)
                                  }
                                >
                                  <UserCheck size={14} />
                                  <span>Activar</span>
                                </button>
                              )}

                              {user.is_active && (
                                <button
                                  className="action-menu-item"
                                  onClick={() =>
                                    handleStatusChange(user.id, false)
                                  }
                                >
                                  <UserX size={14} />
                                  <span>Desactivar</span>
                                </button>
                              )}

                              <button
                                className="action-menu-item delete"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 size={14} />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="no-data">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pagination">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Anterior
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Mostrar páginas alrededor de la página actual
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
              }
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  className={`pagination-number ${
                    currentPage === pageNum ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal para añadir/editar usuario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {modalMode === "add" ? "Añadir Usuario" : "Editar Usuario"}
              </h2>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="full_name">Nombre completo</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleFormChange}
                  required
                />
                {formErrors.full_name && (
                  <p className="input-error">{formErrors.full_name}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
                {formErrors.email && (
                  <p className="input-error">{formErrors.email}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="role">Rol</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                >
                  <option value="STUDENT">Estudiante</option>
                  <option value="TEACHER">Profesor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                {formErrors.role && (
                  <p className="input-error">{formErrors.role}</p>
                )}
              </div>

              {modalMode === "add" && (
                <>
                  <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.password && (
                      <p className="input-error">{formErrors.password}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm_password">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleFormChange}
                      required
                    />
                    {formErrors.confirm_password && (
                      <p className="input-error">
                        {formErrors.confirm_password}
                      </p>
                    )}
                  </div>
                </>
              )}
              {modalMode === "edit" && (
                <div className="form-group">
                  <label htmlFor="password">
                    Nueva contraseña (dejar en blanco para mantener)
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                  />
                </div>
              )}

              {formData.role === "STUDENT" && (
                <>
                  <div className="form-group">
                    <label htmlFor="student_id">ID de estudiante</label>
                    <input
                      type="text"
                      id="student_id"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleFormChange}
                    />
                    {formErrors.student_id && (
                      <p className="input-error">{formErrors.student_id}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="program">Programa</label>
                    <input
                      type="text"
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleFormChange}
                    />
                    {formErrors.program && (
                      <p className="input-error">{formErrors.program}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="semester">Semestre</label>
                    <input
                      type="number"
                      id="semester"
                      name="semester"
                      min="1"
                      max="12"
                      value={formData.semester}
                      onChange={handleFormChange}
                    />
                    {formErrors.semester && (
                      <p className="input-error">{formErrors.semester}</p>
                    )}
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  {modalMode === "add" ? "Crear Usuario" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
