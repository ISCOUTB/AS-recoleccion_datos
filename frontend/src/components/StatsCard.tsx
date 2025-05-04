import type { FC } from "react"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  color: string
}

const StatsCard: FC<StatsCardProps> = ({ title, value, subtitle, icon: Icon, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
        <Icon color={color} />
      </div>
      <div className="stat-content">
        <h3 className= "stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        <p className="stat-subtitle">{subtitle}</p>
      </div>
    </div>
  )
}

export default StatsCard
