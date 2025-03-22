import type React from "react"
import { useState } from "react"
import "./App.css"
import students from "./assets/students.png"

const App: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(`Correo: ${email} - Contraseña: ${password}`)
  }

  return (
    <div className="container">
      <div className="left-section">
        <div className="text-container">
          <h1>SCIENCE STEM</h1>
          <h2>Un impulso más para seguir adelante</h2>
        </div>
        <div className="illustration-container">
          <img src={students} alt="Estudiantes colaborando" className="illustration" />
        </div>
      </div>

      <div className="right-section">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="email" className="label">
                Correo Institucional
              </label>
              <input
                id="email"
                type="email"
                placeholder="Correo Institucional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            <button type="submit" className="button">
              Ingresar
            </button>

            <div className="links">
              <a href="/forgot-password" className="link">
                ¿Olvidaste tu contraseña? Haz click aquí
              </a>
              <a href="/register" className="link">
                Regístrate
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
