import { GraduationCap, Award, Calendar } from "lucide-react"
import "./AcademicInfo.css"

interface AcademicInfoProps {
  career: string
  semester: string
  credits: number
  totalCredits: number
  period: string
  status: string
}

const AcademicInfo = ({ career, semester, credits, totalCredits, period, status }: AcademicInfoProps) => {
  const progressPercentage = (credits / totalCredits) * 100

  return (
    <div className="academic-info">
      <div className="info-card">
        <div className="card-icon">
          <GraduationCap size={20} />
        </div>
        <div className="card-content">
          <h3>Carrera</h3>
          <p className="card-title">{career}</p>
          <p className="card-subtitle">{semester}</p>
        </div>
      </div>

      <div className="info-card">
        <div className="card-icon">
          <Award size={20} />
        </div>
        <div className="card-content">
          <h3>Créditos</h3>
          <p className="card-title">
            {credits} <span className="text-muted">/ {totalCredits}</span>
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      <div className="info-card">
        <div className="card-icon">
          <Calendar size={20} />
        </div>
        <div className="card-content">
          <h3>Período Actual</h3>
          <p className="card-title">{period}</p>
          <p className="card-subtitle">{status}</p>
        </div>
      </div>
    </div>
  )
}

export default AcademicInfo

