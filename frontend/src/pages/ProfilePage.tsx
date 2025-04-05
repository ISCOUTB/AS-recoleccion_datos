"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { User, Mail, Lock, Camera, Save, X, Eye, EyeOff } from "lucide-react"
import "./ProfilePage.css"
import { useNavigate } from "react-router-dom"
import AvatarImage from "../assets/image.jpg"

interface UserProfile {
  name: string
  email: string
  role: string
  studentId: string
  phone: string
  bio: string
}

const ProfilePage = () => {
  const navigate = useNavigate()

  // Estado para los datos del perfil
  const [profile, setProfile] = useState<UserProfile>({
    name: "Ana María García",
    email: "ana.garcia@universidad.edu",
    role: "Estudiante",
    studentId: "A12345678",
    phone: "+52 123 456 7890",
    bio: "Estudiante de Ingeniería en Sistemas, apasionada por la tecnología y el desarrollo de software.",
  })

  // Estado para la imagen de perfil
  const [avatarUrl, setAvatarUrl] = useState<string>(`${AvatarImage}`)
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  // Validar y guardar cambios de contraseña
  const savePasswordChanges = () => {
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

    // Aquí iría la lógica para cambiar la contraseña en el backend

    // Mostrar mensaje de éxito
    setSuccessMessage("Contraseña actualizada correctamente")

    // Limpiar campos
    setPasswords({
      current: "",
      new: "",
      confirm: "",
    })

    // Redirigir a la página principal después de un breve retraso
    setTimeout(() => {
      navigate("/")
    }, 1500)
  }

  // Guardar cambios del perfil
  const saveProfileChanges = () => {
    // Aquí iría la lógica para guardar los cambios en el backend

    // Si hay un nuevo avatar, subirlo
    if (newAvatar) {
      // Aquí iría la lógica para subir la imagen
      // Por ahora, simplemente actualizamos la URL
      setAvatarUrl(previewUrl || avatarUrl)
      setNewAvatar(null)
      setPreviewUrl(null)
    }

    // Mostrar mensaje de éxito
    setSuccessMessage("Perfil actualizado correctamente")

    // Redirigir a la página principal después de un breve retraso
    setTimeout(() => {
      navigate("/")
    }, 1500)
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
              <img src={previewUrl || avatarUrl} alt="Foto de perfil" className="profile-avatar" />
              <button className="avatar-edit-button" onClick={triggerFileInput}>
                <Camera size={20} />
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
              <label htmlFor="name">Nombre completo</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input type="text" id="name" name="name" value={profile.name} onChange={handleProfileChange} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input type="email" id="email" name="email" value={profile.email} onChange={handleProfileChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="studentId">Matrícula</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={profile.studentId}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input type="tel" id="phone" name="phone" value={profile.phone} onChange={handleProfileChange} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Biografía</label>
              <textarea id="bio" name="bio" value={profile.bio} onChange={handleProfileChange} rows={4} />
            </div>

            <div className="form-actions">
              <button className="save-button" onClick={saveProfileChanges}>
                <Save size={18} />
                <span>Guardar cambios</span>
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
              <button className="save-button" onClick={savePasswordChanges}>
                <Save size={18} />
                <span>Actualizar contraseña</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage

