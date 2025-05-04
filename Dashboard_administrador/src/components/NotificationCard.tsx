import type { FC } from "react"

interface NotificationCardProps {
  title: string
  message: string
}

const NotificationCard: FC<NotificationCardProps> = ({ title, message }) => {
  return (
    <div className="notification-card">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}

export default NotificationCard
