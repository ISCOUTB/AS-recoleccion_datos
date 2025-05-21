"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  type: "class" | "meeting" | "deadline" | "other"
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Reunión de profesores",
    date: "2025-04-21",
    time: "10:00 - 11:30",
    location: "Sala de Conferencias A",
    type: "meeting",
  },
  {
    id: "2",
    title: "Clase de Programación",
    date: "2025-04-21",
    time: "13:00 - 14:30",
    location: "Aula 201",
    type: "class",
  },
  {
    id: "3",
    title: "Entrega de calificaciones",
    date: "2025-04-23",
    time: "23:59",
    location: "Plataforma virtual",
    type: "deadline",
  },
  {
    id: "4",
    title: "Webinar: Nuevas tecnologías",
    date: "2025-04-24",
    time: "16:00 - 17:30",
    location: "Zoom",
    type: "other",
  },
  {
    id: "5",
    title: "Reunión de departamento",
    date: "2025-04-25",
    time: "09:00 - 10:30",
    location: "Sala de Juntas",
    type: "meeting",
  },
]

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events] = useState<Event[]>(mockEvents)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  // Funciones para navegar entre meses
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Obtener días del mes actual
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Obtener el primer día de la semana del mes
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Días del mes anterior
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split("T")[0]
      const hasEvents = events.some((event) => event.date === dateString)

      days.push({
        day,
        isCurrentMonth: true,
        date,
        hasEvents,
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  // Obtener eventos del día seleccionado
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return []

    const dateString = selectedDate.toISOString().split("T")[0]
    return events.filter((event) => event.date === dateString)
  }

  const selectedDateEvents = getEventsForSelectedDate()

  // Formatear fecha
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    return date.toLocaleDateString("es-ES", options)
  }

  // Obtener nombre del mes y año
  const getMonthYearString = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }
    return date.toLocaleDateString("es-ES", options)
  }

  const getEventTypeClass = (type: string) => {
    switch (type) {
      case "class":
        return "event-class"
      case "meeting":
        return "event-meeting"
      case "deadline":
        return "event-deadline"
      default:
        return "event-other"
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Calendario</h1>
        <button className="primary-button">
          <Plus size={16} />
          <span>Nuevo Evento</span>
        </button>
      </div>

      <div className="calendar-container">
        <div className="calendar-sidebar">
          <div className="card">
            <div className="card-header">
              <h2>Eventos</h2>
              {selectedDate && <p className="selected-date">{formatDate(selectedDate)}</p>}
            </div>

            <div className="events-list">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div key={event.id} className={`event-item ${getEventTypeClass(event.type)}`}>
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-details">
                      <p className="event-time">
                        <Clock size={14} />
                        <span>{event.time}</span>
                      </p>
                      <p className="event-location">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-events">No hay eventos programados para este día.</p>
              )}
            </div>
          </div>

          <div className="card event-types">
            <h3>Tipos de eventos</h3>
            <div className="event-type-list">
              <div className="event-type">
                <span className="event-type-color event-class"></span>
                <span>Clases</span>
              </div>
              <div className="event-type">
                <span className="event-type-color event-meeting"></span>
                <span>Reuniones</span>
              </div>
              <div className="event-type">
                <span className="event-type-color event-deadline"></span>
                <span>Fechas límite</span>
              </div>
              <div className="event-type">
                <span className="event-type-color event-other"></span>
                <span>Otros</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card calendar-main">
          <div className="calendar-header">
            <h2>{getMonthYearString(currentMonth)}</h2>
            <div className="calendar-nav">
              <button className="icon-button" onClick={prevMonth}>
                <ChevronLeft size={20} />
              </button>
              <button className="icon-button" onClick={nextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              <div>Dom</div>
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div>Sáb</div>
            </div>

            <div className="calendar-days">
              {calendarDays.map((dayObj) => (
                dayObj.day && dayObj.date ? (
                  <button
                    key={"day"}
                    type="button"
                    className={`calendar-day ${!dayObj.isCurrentMonth ? "inactive" : ""} ${
                      selectedDate &&
                      dayObj.date.getDate() === selectedDate.getDate() &&
                      dayObj.date.getMonth() === selectedDate.getMonth() &&
                      dayObj.date.getFullYear() === selectedDate.getFullYear()
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedDate(dayObj.date)}
                  >
                    <span className="day-number">{dayObj.day}</span>
                    {dayObj.hasEvents && <span className="event-indicator"></span>}
                  </button>
                ) : (
                  <div key={"day-inactive"} className="calendar-day inactive"></div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarPage
