"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import config from "../config"
import "../styles/AcademicSurvey.css"

interface Question {
  id: number
  question_text: string
  question_type: string
  required: boolean
  options: Option[]
}

interface Option {
  id: number
  option_text: string
}

interface Survey {
  id: number
  title: string
  description: string
}

interface Answer {
  question_id: number
  answer_text?: string
  selected_option_id?: number
}

const AcademicSurvey = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/")
          return
        }

        const response = await axios.get(`${config.apiUrl}/surveys/active`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data && response.data.length > 0) {
          const activeSurvey = response.data[0]
          setSurvey(activeSurvey)

          // Obtener detalles de la encuesta
          const detailResponse = await axios.get(`${config.apiUrl}/surveys/${activeSurvey.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          setQuestions(detailResponse.data.questions)
        }
      } catch (err) {
        console.error("Error al cargar la encuesta:", err)
        setError("No se pudo cargar la encuesta. Por favor, intenta más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchSurvey()
  }, [navigate])

  const handleOptionSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        selected_option_id: optionId,
      },
    }))
  }

  const handleTextAnswer = (questionId: number, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        answer_text: text,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que todas las preguntas requeridas tengan respuesta
    const requiredQuestions = questions.filter((q) => q.required)
    const unansweredQuestions = requiredQuestions.filter((q) => !answers[q.id])

    if (unansweredQuestions.length > 0) {
      setError("Por favor, responde todas las preguntas requeridas.")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      await axios.post(
        `${config.apiUrl}/surveys/${survey?.id}/submit`,
        {
          answers: Object.values(answers),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setSubmitted(true)

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (err) {
      console.error("Error al enviar la encuesta:", err)
      setError("No se pudo enviar la encuesta. Por favor, intenta más tarde.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="survey-container">
        <div className="survey-loading">Cargando encuesta...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="survey-container">
        <div className="survey-error">{error}</div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="survey-container">
        <div className="survey-success">
          <h2>¡Gracias por completar la encuesta!</h2>
          <p>Tus respuestas nos ayudarán a mejorar tu experiencia académica.</p>
        </div>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="survey-container">
        <div className="survey-empty">No hay encuestas disponibles en este momento.</div>
      </div>
    )
  }

  return (
    <div className="survey-container">
      <div className="survey-header">
        <h2>{survey.title}</h2>
        <span className="new-badge">Nuevo</span>
      </div>

      <p className="survey-description">{survey.description}</p>

      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
          <div key={question.id} className="survey-question">
            <p>
              {question.question_text}
              {question.required && <span className="required-mark">*</span>}
            </p>

            {question.question_type === "multiple_choice" ? (
              <div className="options-column">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`option-button ${
                      answers[question.id]?.selected_option_id === option.id ? "selected" : ""
                    }`}
                    onClick={() => handleOptionSelect(question.id, option.id)}
                  >
                    {option.option_text}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="text-answer"
                placeholder="Escribe tu respuesta aquí..."
                value={answers[question.id]?.answer_text ?? ""}
                onChange={(e) => handleTextAnswer(question.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Enviando..." : "Enviar Respuestas"}
        </button>
      </form>
    </div>
  )
}

export default AcademicSurvey

