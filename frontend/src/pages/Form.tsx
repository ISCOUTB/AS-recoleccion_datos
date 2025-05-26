"use client"

import { useState } from "react"
import "../styles/Form.css"

interface QuizAnswer {
  questionId: number
  value: string
  dimension: string
}

interface QuizQuestion {
  id: number
  text: string
  type: "text" | "number" | "date" | "select"
  options?: string[]
  dimension: string
  placeholder?: string
  required: boolean
}

export default function QuizInterface() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState<string>("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({})

  const questions: QuizQuestion[] = [
    {
      id: 1,
      text: "¿Cuál es tu estado académico actual?",
      type: "select",
      dimension: "Académica",
      options: ["Activo", "En pausa académica", "Retirado temporalmente", "Egresado"],
      required: true,
    },
    {
      id: 2,
      text: "¿Cuál fue tu fecha de ingreso a la universidad?",
      type: "date",
      dimension: "Académica",
      required: true,
    },
    {
      id: 3,
      text: "¿Cuál es tu promedio ponderado acumulado actual?",
      type: "number",
      dimension: "Rendimiento",
      placeholder: "Ej: 4.2 (escala de 0.0 a 5.0)",
      required: true,
    },
    {
      id: 4,
      text: "¿Cuál fue tu puntaje global en las pruebas ICFES/Saber 11?",
      type: "number",
      dimension: "Rendimiento",
      placeholder: "Ej: 350",
      required: true,
    },
    {
      id: 5,
      text: "¿Cuántos créditos académicos has completado hasta la fecha?",
      type: "number",
      dimension: "Rendimiento",
      placeholder: "Ej: 85",
      required: true,
    },
    {
      id: 6,
      text: "¿Cuál es tu clasificación en el SISBEN?",
      type: "select",
      dimension: "Socioeconómica",
      options: [
        "A1",
        "A2",
        "A3",
        "A4",
        "A5",
        "B1",
        "B2",
        "B3",
        "B4",
        "B5",
        "B6",
        "B7",
        "C1",
        "C2",
        "C3",
        "C4",
        "C5",
        "C6",
        "C7",
        "C8",
        "C9",
        "C10",
        "C11",
        "C12",
        "C13",
        "C14",
        "C15",
        "C16",
        "C17",
        "C18",
        "No tengo clasificación SISBEN",
      ],
      required: true,
    },
    {
      id: 7,
      text: "¿Cuál es el estrato socioeconómico de tu vivienda actual?",
      type: "select",
      dimension: "Socioeconómica",
      options: ["Estrato 1", "Estrato 2", "Estrato 3", "Estrato 4", "Estrato 5", "Estrato 6"],
      required: true,
    },
    {
      id: 8,
      text: "¿Tienes alguna beca o apoyo económico actualmente?",
      type: "select",
      dimension: "Socioeconómica",
      options: [
        "Beca completa (matrícula y sostenimiento)",
        "Beca parcial (solo matrícula)",
        "Crédito ICETEX",
        "Apoyo institucional",
        "No tengo apoyo económico",
      ],
      required: true,
    },
    {
      id: 9,
      text: "¿En qué año te graduaste del bachillerato?",
      type: "number",
      dimension: "Educativa",
      placeholder: "Ej: 2020",
      required: true,
    },
    {
      id: 10,
      text: "¿Cuál es tu número de teléfono?",
      type: "text",
      dimension: "Personal",
      placeholder: "Ej: 3001234567",
      required: true,
    },
  ]

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setCurrentAnswer(answers[currentQuestionIndex - 1]?.value ?? "")
    }
  }

  const handleNext = () => {
    if (currentAnswer.trim()) {
      const answerData: QuizAnswer = {
        questionId: currentQuestion.id,
        value: currentAnswer.trim(),
        dimension: currentQuestion.dimension,
      }

      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answerData,
      }))

      if (isLastQuestion) {
        const allAnswers = {
          ...answers,
          [currentQuestionIndex]: answerData,
        }

        // GUARDAR RESPUESTAS DEL FORMULARIO DE MANERA MÁS SIMPLE
        const formData = {
          estadoAcademico: allAnswers[0]?.value ?? "",
          fechaIngreso: allAnswers[1]?.value ?? "",
          promedio: allAnswers[2]?.value ?? "",
          puntajeICFES: allAnswers[3]?.value ?? "",
          creditos: allAnswers[4]?.value ?? "",
          sisben: allAnswers[5]?.value ?? "",
          estrato: allAnswers[6]?.value ?? "",
          beca: allAnswers[7]?.value ?? "",
          anoGraduacion: allAnswers[8]?.value ?? "",
          telefono: allAnswers[9]?.value ?? "",
        }

        localStorage.setItem("formData", JSON.stringify(formData))
        localStorage.setItem("formCompleted", "true")
        console.log("✅ DATOS DEL FORMULARIO GUARDADOS:", formData)
        setIsCompleted(true)
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setCurrentAnswer(answers[currentQuestionIndex + 1]?.value ?? "")
      }
    }
  }

  const handleInputChange = (value: string) => {
    setCurrentAnswer(value)
  }

  const handleRedirectToDashboard = () => {
    window.location.href = "/dashboard"
  }

  if (isCompleted) {
    return (
      <div className="quiz-container">
        <div className="quiz-card results-card">
          <h2 className="quiz-title results-title">¡Información académica completada!</h2>
          <p className="results-message">
            Tu perfil académico ha sido actualizado exitosamente. Ahora puedes acceder a tu dashboard completo.
          </p>
          <div className="completion-summary">
            <div className="summary-item">
              <span className="summary-icon">✅</span>
              <span>Información personal registrada</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">✅</span>
              <span>Datos académicos completados</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">✅</span>
              <span>Información socioeconómica actualizada</span>
            </div>
          </div>
          <button className="nav-button next-button results-button" onClick={handleRedirectToDashboard}>
            Ver Mi Dashboard
          </button>
        </div>
      </div>
    )
  }

  const renderInput = () => {
    switch (currentQuestion.type) {
      case "select":
        return (
          <select
            className="quiz-input quiz-select"
            value={currentAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            required={currentQuestion.required}
          >
            <option value="">Selecciona una opción</option>
            {currentQuestion.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case "number":
        return (
          <input
            type="number"
            className="quiz-input"
            value={currentAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={currentQuestion.placeholder}
            required={currentQuestion.required}
            step="0.1"
            min="0"
          />
        )
      case "date":
        return (
          <input
            type="date"
            className="quiz-input"
            value={currentAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            required={currentQuestion.required}
          />
        )
      default:
        return (
          <input
            type={currentQuestion.type}
            className="quiz-input"
            value={currentAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={currentQuestion.placeholder}
            required={currentQuestion.required}
          />
        )
    }
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <div className="quiz-header">
          <h2 className="quiz-title">Completar Perfil Académico</h2>
          <p className="quiz-subtitle">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </p>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="question-container">
          <p className="question-text">{currentQuestion.text}</p>
          <p className="question-dimension">Categoría: {currentQuestion.dimension}</p>
        </div>
        <div className="input-container">{renderInput()}</div>
        <div className="navigation-buttons">
          <button className="nav-button prev-button" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            ← Anterior
          </button>
          <button className="nav-button next-button" onClick={handleNext} disabled={!currentAnswer.trim()}>
            {isLastQuestion ? "Completar Perfil" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  )
}
