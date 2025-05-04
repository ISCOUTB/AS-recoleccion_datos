import WelcomeCard from "../components/WelcomeCard"
import StatsCard from "../components/StatsCard"
import NotificationCard from "../components/NotificationCard"
import { BookOpen, Users, BarChart3 } from "lucide-react"

const DashboardPage = () => {
  return (
    <div className="dashboard-content">
      <WelcomeCard
        name="Carlos"
        message="El sistema está funcionando correctamente"
        metric="99.8%"
        metricLabel="Uptime"
      />

      <div className="stats-container">
        <StatsCard title="Usuarios" value="1,248" subtitle="Usuarios activos" icon={Users} color="#4a6cf7" />
        <StatsCard title="Cursos" value="64" subtitle="Cursos disponibles" icon={BookOpen} color="#6577F3" />
        <StatsCard title="Actividad" value="89%" subtitle="Tasa de participación" icon={BarChart3} color="#8088E8" />
      </div>

      <NotificationCard title="Notificaciones pendientes" message="No hay notificaciones pendientes en este momento." />
    </div>
  )
}

export default DashboardPage
