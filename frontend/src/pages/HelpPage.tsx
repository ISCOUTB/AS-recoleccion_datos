"use client"

import { useState, useRef, type ChangeEvent, type FormEvent } from "react"
import { HelpCircle, Send, Upload, X, Check, ChevronDown, ChevronUp, Loader } from "lucide-react"
import "../styles/HelpPage.css"
import axios from "axios"
import config from "../config"

type FaqItem = {
  question: string
  answer: string
}

const HelpPage = () => {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    email: "",
    priority: "media",
  })

  // Estado para archivos adjuntos
  const [attachments, setAttachments] = useState<File[]>([])

  // Estado para mensajes de éxito/error
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({
    type: null,
    message: "",
  })

  // Estado para controlar qué FAQ está abierta
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Estado para indicar si se está enviando el formulario
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Referencia para el input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lista de preguntas frecuentes
  const faqList: FaqItem[] = [
    {
      question: "¿Cómo puedo cambiar mi contraseña?",
      answer:
        "Para cambiar tu contraseña, ve a tu perfil haciendo clic en el ícono de configuración en la esquina superior derecha y selecciona 'Perfil'. Luego, ve a la pestaña 'Seguridad' donde encontrarás la opción para cambiar tu contraseña.",
    },
    {
      question: "¿Cómo puedo ver mis calificaciones?",
      answer:
        "Puedes ver tus calificaciones en la sección 'Académico'. Allí encontrarás un desglose de todas tus asignaturas con sus respectivas calificaciones y créditos.",
    },
    {
      question: "¿Qué hago si no puedo acceder a mi cuenta?",
      answer:
        "Si no puedes acceder a tu cuenta, intenta restablecer tu contraseña usando la opción 'Olvidé mi contraseña' en la página de inicio de sesión. Si el problema persiste, contacta al soporte técnico a través de este formulario o escribe directamente a soporte@universidad.edu.",
    },
    {
      question: "¿Cómo puedo inscribirme en nuevos cursos?",
      answer:
        "Para inscribirte en nuevos cursos, ve a la sección 'Cursos' y selecciona la opción 'Inscribir nuevo curso'. Allí verás la lista de cursos disponibles para el período actual y podrás seleccionar los que desees tomar.",
    },
    {
      question: "¿Puedo acceder a la plataforma desde mi dispositivo móvil?",
      answer:
        "Sí, nuestra plataforma es completamente responsiva y puedes acceder desde cualquier dispositivo móvil a través del navegador. También contamos con una aplicación móvil disponible para iOS y Android que puedes descargar desde las tiendas oficiales.",
    },
  ]

  // Manejador para cambios en los campos del formulario
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejador para subir archivos
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Convertir FileList a array y añadir a los adjuntos existentes
      const newFiles = Array.from(files)
      setAttachments((prev) => [...prev, ...newFiles])

      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Manejador para eliminar un archivo adjunto
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Manejador para abrir/cerrar preguntas frecuentes
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  // Manejador para enviar el formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validar que los campos requeridos estén completos
    if (!formData.issueType || !formData.description) {
      setSubmitStatus({
        type: "error",
        message: "Por favor completa todos los campos requeridos.",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem("token")

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData()
      formDataToSend.append("issue_type", formData.issueType)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("priority", formData.priority)

      if (formData.email) {
        formDataToSend.append("contact_email", formData.email)
      }

      // Añadir archivos adjuntos
      attachments.forEach((file, index) => {
        formDataToSend.append(`attachment_${index}`, file)
      })

      // Enviar solicitud al backend
      await axios.post(`${config.apiUrl}/support/ticket`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      // Mostrar mensaje de éxito
      setSubmitStatus({
        type: "success",
        message: "Tu solicitud ha sido enviada correctamente. Te contactaremos pronto.",
      })

      // Limpiar el formulario después de enviar
      setFormData({
        issueType: "",
        description: "",
        email: "",
        priority: "media",
      })
      setAttachments([])
    } catch (error) {
      console.error("Error al enviar el formulario:", error)

      // Mostrar mensaje de error
      setSubmitStatus({
        type: "error",
        message: "Ocurrió un error al enviar tu solicitud. Por favor intenta nuevamente.",
      })
    } finally {
      setIsSubmitting(false)

      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        setSubmitStatus({
          type: null,
          message: "",
        })
      }, 5000)
    }
  }

  return (
    <div className="help-page">
      <div className="help-header">
        <HelpCircle size={28} />
        <h1>Centro de Ayuda</h1>
      </div>

      {submitStatus.type && (
        <div className={`status-message ${submitStatus.type}`}>
          {submitStatus.type === "success" ? <Check size={20} /> : <X size={20} />}
          <p>{submitStatus.message}</p>
        </div>
      )}

      <div className="help-content">
        <div className="help-form-container">
          <h2>Reportar un problema</h2>
          <p className="help-description">
            Describe el problema que estás experimentando y nuestro equipo de soporte te ayudará lo antes posible.
          </p>

          <form className="help-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="issueType">
                Tipo de problema <span className="required">*</span>
              </label>
              <select id="issueType" name="issueType" value={formData.issueType} onChange={handleInputChange} required>
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="acceso">Problemas de acceso</option>
                <option value="calificaciones">Problemas con calificaciones</option>
                <option value="cursos">Problemas con cursos</option>
                <option value="perfil">Problemas con mi perfil</option>
                <option value="tecnico">Problemas técnicos</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Descripción del problema <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder="Describe detalladamente el problema que estás experimentando..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico para contacto</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu.correo@universidad.edu"
              />
              <p className="field-hint">Dejaremos vacío si prefieres que usemos tu correo institucional registrado.</p>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Prioridad</label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleInputChange}>
                <option value="baja">Baja - No es urgente</option>
                <option value="media">Media - Requiere atención</option>
                <option value="alta">Alta - Problema importante</option>
                <option value="critica">Crítica - No puedo continuar</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="file-upload-input">Adjuntar capturas de pantalla (opcional)</label>
              <div className="file-upload-container">
                <button type="button" className="file-upload-button" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={18} />
                  <span>Seleccionar archivos</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden-input"
                  id="file-upload-input"
                  aria-label="Adjuntar archivos"
                />
                <p className="field-hint">Formatos permitidos: imágenes, PDF, Word (máx. 5MB por archivo)</p>
              </div>

              {attachments.length > 0 && (
                <div className="attachments-list">
                  {attachments.map((file, index) => (
                    <div key={`attachment`} className="attachment-item">
                      <span className="attachment-name">{file.name}</span>
                      <button type="button" className="remove-attachment" onClick={() => removeAttachment(index)}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Enviar solicitud</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="help-resources">
          <div className="faq-section">
            <h2>Preguntas frecuentes</h2>
            <div className="faq-list">
              {faqList.map((faq, index) => (
                <div key={"faq"} className="faq-item">
                  <button className="faq-question" onClick={() => toggleFaq(index)}>
                    <span>{faq.question}</span>
                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {openFaq === index && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="contact-info">
            <h2>Información de contacto</h2>
            <p>Si prefieres contactarnos directamente:</p>
            <ul>
              <li>
                <strong>Correo electrónico:</strong> soporte@universidad.edu
              </li>
              <li>
                <strong>Teléfono:</strong> (01) 234-5678
              </li>
              <li>
                <strong>Horario de atención:</strong> Lunes a viernes de 8:00 a 18:00
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage
