"use client"

import { useState, useEffect, useRef, type ChangeEvent } from "react"
import { User, Mail, Lock, Camera, Save, X, Eye, EyeOff, Loader } from "lucide-react"
import "../styles/ProfilePage.css"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
interface UserProfile {
  id: number
  full_name: string
  email: string
  role: string
  student_id: string
  phone: string
  bio: string
  program: string
  semester: number
  avatar_url?: string
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estado para los datos del perfil
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    full_name: "",
    email: "",
    role: "Estudiante",
    student_id: "",
    phone: "",
    bio: "",
    program: "",
    semester: 0,
  })

  // Estado para la imagen de perfil
  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder.svg?height=150&width=150")
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previousAvatarUrl, setPreviousAvatarUrl] = useState<string | null>(null)

  // Estado para la contraseña
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  // Estado para mostrar/ocultar contraseñas
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Estado para mensajes de error
  const [errors, setErrors] = useState({
    password: "",
    general: "",
  })

  // Estado para mensajes de éxito
  const [successMessage, setSuccessMessage] = useState("")

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("personal")

  // Referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Función para obtener la URL completa de la imagen
  const getFullImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg?height=150&width=150"

    // Si la URL ya es absoluta o es un placeholder, devolverla tal cual
    if (url.startsWith("http") || url.startsWith("/placeholder")) {
      return url
    }

    // Para rutas que comienzan con /static, usar la URL base sin /api
    if (url.startsWith("/static")) {
      // Extraer la base URL sin /api
      const baseUrl = config.apiUrl.replace(/\/api\/?$/, "")
      return `${baseUrl}${url}`
    }

    // Para otras rutas relativas
    return `${config.apiUrl}${url}`
  }

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/")
          return
        }

        const response = await axios.get(`${config.apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const userData = response.data
        setProfile({
          id: userData.id,
          full_name: userData.full_name || "",
          email: userData.email || "",
          role: "Estudiante",
          student_id: userData.student_id || "",
          phone: userData.phone || "",
          bio: userData.bio || "",
          program: userData.program || "",
          semester: userData.semester || 0,
        })

        if (userData.avatar_url) {
          setAvatarUrl(userData.avatar_url)
          // Guardar la URL anterior para posible eliminación
          setPreviousAvatarUrl(userData.avatar_url)
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        setErrors((prev) => ({ ...prev, general: "No se pudieron cargar los datos del usuario" }))

        // Si hay un error de autenticación, redirigir al login
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("token")
          navigate("/")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  // Manejador para cambios en los campos del perfil
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejador para cambios en los campos de contraseña
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar errores al escribir
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }))
    }
  }

  // Manejador para cambiar la foto de perfil
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewAvatar(file)

      // Crear URL para previsualización
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Abrir el selector de archivos
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Cancelar cambio de avatar
  const cancelAvatarChange = () => {
    setNewAvatar(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Función para eliminar la imagen anterior
  const deleteOldAvatar = async (avatarPath: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Extraer el nombre del archivo de la ruta
      const fileName = avatarPath.split("/").pop()
      if (!fileName) return

      // Enviar solicitud para eliminar el archivo
      await axios.delete(`${config.apiUrl}/users/delete-avatar/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Avatar anterior eliminado con éxito")
    } catch (error) {
      console.error("Error al eliminar avatar anterior:", error)
      // No interrumpimos el flujo si falla la eliminación
    }
  }

  // Validar y guardar cambios de contraseña
  const savePasswordChanges = async () => {
    // Validar que la contraseña actual no esté vacía
    if (!passwords.current) {
      setErrors((prev) => ({ ...prev, password: "Debes ingresar tu contraseña actual" }))
      return
    }

    // Validar que la nueva contraseña no esté vacía
    if (!passwords.new) {
      setErrors((prev) => ({ ...prev, password: "Debes ingresar una nueva contraseña" }))
      return
    }

    // Validar que la nueva contraseña tenga al menos 8 caracteres
    if (passwords.new.length < 8) {
      setErrors((prev) => ({ ...prev, password: "La contraseña debe tener al menos 8 caracteres" }))
      return
    }

    // Validar que las contraseñas coincidan
    if (passwords.new !== passwords.confirm) {
      setErrors((prev) => ({ ...prev, password: "Las contraseñas no coinciden" }))
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/")
        return
      }

      // Enviar solicitud para cambiar la contraseña
      await axios.put(
        `${config.apiUrl}/users/change-password`,
        {
          current_password: passwords.current,
          new_password: passwords.new,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Mostrar mensaje de éxito
      setSuccessMessage("Contraseña actualizada correctamente")

      // Limpiar campos
      setPasswords({
        current: "",
        new: "",
        confirm: "",
      })

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error)

      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        setErrors((prev) => ({ ...prev, password: error.response?.data?.detail || "Error desconocido" }))
      } else {
        setErrors((prev) => ({ ...prev, password: "Error al cambiar la contraseña" }))
      }
    } finally {
      setSaving(false)
    }
  }

  // Guardar cambios del perfil
  const saveProfileChanges = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/")
        return
      }

      // Preparar datos para enviar
      const formData = new FormData()
      formData.append("full_name", profile.full_name)
      formData.append("phone", profile.phone || "")
      formData.append("bio", profile.bio || "")

      // Si hay un nuevo avatar, añadirlo al FormData
      if (newAvatar) {
        formData.append("avatar", newAvatar)

        // Indicar que se debe eliminar la imagen anterior
        if (previousAvatarUrl && previousAvatarUrl.includes("/static/avatars/")) {
          formData.append("delete_previous_avatar", "true")
        }
      }

      // Enviar solicitud para actualizar el perfil
      const response = await axios.put(`${config.apiUrl}/users/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      // Actualizar datos locales con la respuesta
      if (response.data.avatar_url) {
        // Si había una imagen anterior y se subió una nueva, intentar eliminar la anterior
        if (
          previousAvatarUrl &&
          previousAvatarUrl !== response.data.avatar_url &&
          previousAvatarUrl.includes("/static/avatars/")
        ) {
          await deleteOldAvatar(previousAvatarUrl)
        }

        // Actualizar la URL del avatar
        setAvatarUrl(response.data.avatar_url)
        setPreviousAvatarUrl(response.data.avatar_url)
      }

      // Limpiar estado de avatar
      setNewAvatar(null)
      setPreviewUrl(null)

      // Mostrar mensaje de éxito
      setSuccessMessage("Perfil actualizado correctamente")

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)

      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        setErrors((prev) => ({ ...prev, general: error.response?.data?.detail || "Error desconocido" }))
      } else {
        setErrors((prev) => ({ ...prev, general: "Error al actualizar el perfil" }))
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size={30} className="animate-spin" />
        <p>Cargando datos del perfil...</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">Mi Perfil</h1>

      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      {errors.general && (
        <div className="error-message">
          <p>{errors.general}</p>
        </div>
      )}

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <User size={18} />
          <span>Información Personal</span>
        </button>
        <button
          className={`tab-button ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Lock size={18} />
          <span>Seguridad</span>
        </button>
      </div>

      {activeTab === "personal" && (
        <div className="profile-section">
          <div className="avatar-section">
            <div className="avatar-container">
              <img src={previewUrl || getFullImageUrl(avatarUrl)} alt="Foto de perfil" className="profile-avatar" />
              <button className="avatar-edit-button" onClick={triggerFileInput}>
                <Camera size={"1.5em"} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden-input"
              />
            </div>

            {previewUrl && (
              <div className="avatar-actions">
                <button className="cancel-button" onClick={cancelAvatarChange}>
                  <X size={16} />
                  <span>Cancelar</span>
                </button>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="full_name">Nombre completo</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  disabled
                />
                <p className="field-hint">El correo electrónico no se puede cambiar</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="student_id">Matrícula</label>
                <input
                  type="text"
                  id="student_id"
                  name="student_id"
                  value={profile.student_id}
                  onChange={handleProfileChange}
                  disabled
                />
                <p className="field-hint">La matrícula no se puede cambiar</p>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input type="tel" id="phone" name="phone" value={profile.phone} onChange={handleProfileChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="program">Programa</label>
                <input type="text" id="program" name="program" value={profile.program} disabled />
              </div>

              <div className="form-group">
                <label htmlFor="semester">Semestre</label>
                <input type="number" id="semester" name="semester" value={profile.semester} disabled />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Biografía</label>
              <textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} rows={4} />
            </div>

            <div className="form-actions">
              <button className="save-button" onClick={saveProfileChanges} disabled={saving}>
                {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{saving ? "Guardando..." : "Guardar cambios"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="profile-section">
          <div className="password-section">
            <h2>Cambiar contraseña</h2>

            {errors.password && (
              <div className="error-message">
                <p>{errors.password}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="current">Contraseña actual</label>
              <div className="password-input-container">
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    id="current"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                  />
                </div>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new">Nueva contraseña</label>
              <div className="password-input-container">
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    id="new"
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                  />
                </div>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirmar nueva contraseña</label>
              <div className="password-input-container">
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    id="confirm"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                  />
                </div>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <p>La contraseña debe:</p>
              <ul>
                <li className={passwords.new.length >= 8 ? "met" : ""}>Tener al menos 8 caracteres</li>
                <li className={/[A-Z]/.test(passwords.new) ? "met" : ""}>Incluir al menos una letra mayúscula</li>
                <li className={/[0-9]/.test(passwords.new) ? "met" : ""}>Incluir al menos un número</li>
                <li className={/[^A-Za-z0-9]/.test(passwords.new) ? "met" : ""}>
                  Incluir al menos un carácter especial
                </li>
              </ul>
            </div>

            <div className="form-actions">
              <button className="save-button" onClick={savePasswordChanges} disabled={saving}>
                {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{saving ? "Actualizando..." : "Actualizar contraseña"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
