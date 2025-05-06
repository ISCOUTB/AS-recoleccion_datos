import type { FC } from "react"

interface WelcomeCardProps {
  name: string
  message: string
  metric: string
  metricLabel: string
}

const WelcomeCard: FC<WelcomeCardProps> = ({ name, message, metric, metricLabel }) => {
  return (
    <div className="welcome-card">
      <div className="welcome-content">
        <h2>¡Bienvenido, {name}!</h2>
        <p>{message}</p>
      </div>
      <div className="metric-container">
        <div className="metric">
          <h3>{metricLabel}</h3>
          <p className="metric-value">{metric}</p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeCard
