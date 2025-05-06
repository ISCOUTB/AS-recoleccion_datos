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
    <div className="stats-card">
      <div className="stats-icon" style={{ backgroundColor: `${color}20` }}>
        <Icon color={color} />
      </div>
      <div className="stats-info">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
        <p className="stats-subtitle">{subtitle}</p>
      </div>
    </div>
  )
}

export default StatsCard
