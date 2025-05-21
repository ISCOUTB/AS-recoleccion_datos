import { useState } from "react"
import "../styles/Form.css"

interface QuizOption {
  id: string
  text: string
}

interface QuizQuestion {
  id: number
  text: string
  options: QuizOption[]
}

export default function QuizInterface() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const questions: QuizQuestion[] = [
    {
      id: 1,
      text: "¿Cuál es el planeta más grande del sistema solar?",
      options: [
        { id: "marte", text: "Marte" },
        { id: "jupiter", text: "Júpiter" },
        { id: "venus", text: "Venus" },
        { id: "neptuno", text: "Neptuno" },
      ],
    },
    {
      id: 2,
      text: "¿Quién formuló la teoría de la relatividad?",
      options: [
        { id: "isaac", text: "Isaac Newton" },
        { id: "nikola", text: "Nikola Tesla" },
        { id: "albert", text: "Albert Einstein" },
        { id: "galileo", text: "Galileo" },
      ],
    },
    {
      id: 3,
      text: "¿Cuál es elemento químico más abudante en la corteza terrestre?",
      options: [
        { id: "oxigeno", text: "Oxígeno" },
        { id: "hierro", text: "Hierro" },
        { id: "silicio", text: "Silicio" },
        { id: "hidrógeno", text: "Hidrógeno" },
      ],
    },
  ]

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedOption(answers[currentQuestionIndex - 1] ?? null)
    }
  }

  const handleNext = () => {
    if (selectedOption) {
      // Guardar la respuesta actual
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedOption,
      }))

      if (isLastQuestion) {
        // Mostrar la pantalla de resultados
        setIsCompleted(true)
      } else {
        // Avanzar a la siguiente pregunta
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        // Establecer la opción seleccionada si ya se respondió esta pregunta
        setSelectedOption(answers[currentQuestionIndex + 1] ?? null)
      }
    }
  }

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setIsCompleted(false)
    setAnswers({})
  }

  // Renderizar la pantalla de resultados si el cuestionario está completado
  if (isCompleted) {
    return (
      <div className="quiz-container">
        <div className="quiz-card results-card">
          <h2 className="quiz-title results-title">¡Gracias por completar el cuestionario!</h2>
          <p className="results-message">Tus respuestas han sido registradas correctamente.</p>
          <div className="results-summary">
            {questions.map((question, index) => {
              const answerId = answers[index]
              const answerText = question.options.find((opt) => opt.id === answerId)?.text ?? "No respondida"

              return (
                <div key={question.id} className="result-item">
                  <p className="result-question">{question.text}</p>
                  <p className="result-answer">
                    Tu respuesta: <strong>{answerText}</strong>
                  </p>
                </div>
              )
            })}
          </div>
          <button className="nav-button next-button results-button" onClick={handleRestart}>
            Volver a empezar
          </button>
        </div>
      </div>
    )
  }

  // Renderizar el cuestionario
  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2 className="quiz-title">
          Pregunta {currentQuestionIndex + 1} de {totalQuestions}
        </h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="question-container">
          <p className="question-text">{currentQuestion.text}</p>
        </div>
        <div className="options-container">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              className={`option-button ${selectedOption === option.id ? "selected" : ""}`}
              onClick={() => handleOptionSelect(option.id)}
            >
              {option.text}
            </button>
          ))}
        </div>
        <div className="navigation-buttons">
          <button className="nav-button prev-button" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            ← Anterior
          </button>
          <button className="nav-button next-button" onClick={handleNext} disabled={!selectedOption}>
            {isLastQuestion ? "Terminar" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  )
}

