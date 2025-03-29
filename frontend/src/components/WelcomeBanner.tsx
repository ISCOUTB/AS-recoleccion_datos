import "./WelcomeBanner.css"

interface WelcomeBannerProps {
    name: string
    message: string
    average: number
  }
  
  const WelcomeBanner = ({ name, message, average }: WelcomeBannerProps) => {
    return (
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>¡Bienvenida, {name}!</h1>
          <p>{message}</p>
        </div>
        <div className="average-container">
          <span className="average-label">Promedio General</span>
          <span className="average-value">{average.toFixed(1)}</span>
        </div>
      </div>
    )
  }
  
  export default WelcomeBanner
  
  