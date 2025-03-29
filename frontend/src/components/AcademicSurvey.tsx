import type React from "react"
import { useState } from "react"
import "./AcademicSurvey.css"

const AcademicSurvey = () => {
  const [experienceRating, setExperienceRating] = useState<string | null>(null)
  const [careerChange, setCareerChange] = useState<string | null>(null)
  const [supportNeeded, setSupportNeeded] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      experienceRating,
      careerChange,
      supportNeeded,
    })
  }

  return (
    <div className="survey-container">
      <div className="survey-header">
        <h2>Encuesta de Seguimiento Académico</h2>
        <span className="new-badge">Nuevo</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="survey-question">
          <p>¿Cómo calificarías tu experiencia académica actual?</p>
          <div className="options-row">
            <button
              type="button"
              className={`option-button ${experienceRating === "Excelente" ? "selected" : ""}`}
              onClick={() => setExperienceRating("Excelente")}
            >
              Excelente
            </button>
            <button
              type="button"
              className={`option-button ${experienceRating === "Buena" ? "selected" : ""}`}
              onClick={() => setExperienceRating("Buena")}
            >
              Buena
            </button>
            <button
              type="button"
              className={`option-button ${experienceRating === "Regular" ? "selected" : ""}`}
              onClick={() => setExperienceRating("Regular")}
            >
              Regular
            </button>
            <button
              type="button"
              className={`option-button ${experienceRating === "Difícil" ? "selected" : ""}`}
              onClick={() => setExperienceRating("Difícil")}
            >
              Difícil
            </button>
          </div>
        </div>

        <div className="survey-columns">
          <div className="survey-column">
            <div className="survey-question">
              <p>¿Has considerado cambiar de carrera?</p>
              <div className="options-column">
                <button
                  type="button"
                  className={`option-button ${careerChange === "No, estoy seguro/a de mi elección" ? "selected" : ""}`}
                  onClick={() => setCareerChange("No, estoy seguro/a de mi elección")}
                >
                  No, estoy seguro/a de mi elección
                </button>
                <button
                  type="button"
                  className={`option-button ${careerChange === "Sí, algunas veces" ? "selected" : ""}`}
                  onClick={() => setCareerChange("Sí, algunas veces")}
                >
                  Sí, algunas veces
                </button>
                <button
                  type="button"
                  className={`option-button ${careerChange === "Lo estoy considerando seriamente" ? "selected" : ""}`}
                  onClick={() => setCareerChange("Lo estoy considerando seriamente")}
                >
                  Lo estoy considerando seriamente
                </button>
              </div>
            </div>
          </div>

          <div className="survey-column">
            <div className="survey-question">
              <p>¿Necesitas apoyo adicional?</p>
              <div className="options-column">
                <button
                  type="button"
                  className={`option-button ${supportNeeded === "Tutoría académica" ? "selected" : ""}`}
                  onClick={() => setSupportNeeded("Tutoría académica")}
                >
                  Tutoría académica
                </button>
                <button
                  type="button"
                  className={`option-button ${supportNeeded === "Orientación vocacional" ? "selected" : ""}`}
                  onClick={() => setSupportNeeded("Orientación vocacional")}
                >
                  Orientación vocacional
                </button>
                <button
                  type="button"
                  className={`option-button ${supportNeeded === "Apoyo psicológico" ? "selected" : ""}`}
                  onClick={() => setSupportNeeded("Apoyo psicológico")}
                >
                  Apoyo psicológico
                </button>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Enviar Respuestas
        </button>
      </form>
    </div>
  )
}

export default AcademicSurvey