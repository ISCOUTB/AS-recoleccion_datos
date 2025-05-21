"use client"

import { useState } from "react"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, BookOpen } from "lucide-react"
import "../../styles/CoursesPage.css"
interface Course {
  id: string
  title: string
  category: string
  instructor: string
  students: number
  progress: number
  status: "active" | "draft" | "archived"
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introducción a la Programación",
    category: "Desarrollo",
    instructor: "Carlos López",
    students: 128,
    progress: 75,
    status: "active",
  },
  {
    id: "2",
    title: "Matemáticas Avanzadas",
    category: "Ciencias",
    instructor: "Elena Rodríguez",
    students: 94,
    progress: 60,
    status: "active",
  },
  {
    id: "3",
    title: "Diseño UX/UI Fundamentals",
    category: "Diseño",
    instructor: "Ana Martínez",
    students: 76,
    progress: 45,
    status: "active",
  },
  {
    id: "4",
    title: "Inteligencia Artificial para Principiantes",
    category: "Tecnología",
    instructor: "Roberto Fernández",
    students: 112,
    progress: 30,
    status: "active",
  },
  {
    id: "5",
    title: "Desarrollo Web Full Stack",
    category: "Desarrollo",
    instructor: "María González",
    students: 145,
    progress: 90,
    status: "active",
  },
  {
    id: "6",
    title: "Física Cuántica",
    category: "Ciencias",
    instructor: "Javier Sánchez",
    students: 58,
    progress: 20,
    status: "draft",
  },
]

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ??
      course.category.toLowerCase().includes(searchTerm.toLowerCase()) ??
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleActionClick = (courseId: string) => {
    setActionMenuOpen(actionMenuOpen === courseId ? null : courseId)
  }

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter((course) => course.id !== courseId))
    setActionMenuOpen(null)
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "status-active"
      case "draft":
        return "status-pending"
      case "archived":
        return "status-inactive"
      default:
        return ""
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Cursos</h1>
        <button className="primary-button">
          <Plus size={16} />
          <span>Nuevo Curso</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar cursos..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-options">
            <select className="filter-select">
              <option value="all">Todas las categorías</option>
              <option value="development">Desarrollo</option>
              <option value="science">Ciencias</option>
              <option value="design">Diseño</option>
              <option value="technology">Tecnología</option>
            </select>
            <select className="filter-select">
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="draft">Borradores</option>
              <option value="archived">Archivados</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Categoría</th>
                <th>Instructor</th>
                <th>Estudiantes</th>
                <th>Progreso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td className="course-title">
                    <div className="course-icon">
                      <BookOpen size={16} />
                    </div>
                    {course.title}
                  </td>
                  <td>{course.category}</td>
                  <td>{course.instructor}</td>
                  <td>{course.students}</td>
                  <td>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${course.progress}%` }}></div>
                      <span className="progress-text">{course.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(course.status)}`}>
                      {course.status === "active" && "Activo"}
                      {course.status === "draft" && "Borrador"}
                      {course.status === "archived" && "Archivado"}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="action-button" onClick={() => handleActionClick(course.id)}>
                        <MoreHorizontal size={16} />
                      </button>

                      {actionMenuOpen === course.id && (
                        <div className="action-menu">
                          <button className="action-menu-item">
                            <Eye size={14} />
                            <span>Ver detalles</span>
                          </button>
                          <button className="action-menu-item">
                            <Edit size={14} />
                            <span>Editar</span>
                          </button>
                          <button className="action-menu-item delete" onClick={() => handleDeleteCourse(course.id)}>
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

export default CoursesPage
