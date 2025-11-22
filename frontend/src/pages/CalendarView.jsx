import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { taskService } from '../services/api'
import { format } from 'date-fns'
import TaskModal from '../components/TaskModal'
import './CalendarView.css'

const CalendarView = () => {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await taskService.getAll()
      setTasks(response.data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventColor = (task) => {
    if (task.status === 'done') return 'var(--status-done)'
    if (task.status === 'blocked') return 'var(--status-blocked)'
    if (task.status === 'in_progress') return 'var(--status-in-progress)'
    
    const isOverdue = task.due_date && new Date(task.due_date) < new Date()
    if (isOverdue) return 'var(--danger)'
    
    switch (task.priority) {
      case 'urgent': return 'var(--priority-urgent)'
      case 'high': return 'var(--priority-high)'
      case 'medium': return 'var(--priority-medium)'
      default: return 'var(--priority-low)'
    }
  }

  const calendarEvents = tasks
    .filter(task => task.assigned_date)
    .map(task => ({
      id: task.id.toString(),
      title: task.title,
      start: task.assigned_date,
      end: task.due_date || task.assigned_date,
      backgroundColor: getEventColor(task),
      borderColor: getEventColor(task),
      extendedProps: { task }
    }))

  const handleDateClick = (arg) => {
    const clickedDate = format(arg.date, 'yyyy-MM-dd')
    setShowTaskModal(true)
    // You can pre-fill the date in the modal
  }

  const handleEventClick = (arg) => {
    const task = arg.event.extendedProps.task
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleTaskSaved = () => {
    setShowTaskModal(false)
    setSelectedTask(null)
    loadTasks()
  }

  if (loading) {
    return <div className="loading">Loading calendar...</div>
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h1>Calendar View</h1>
        <p className="subtitle">Visualize your tasks on the calendar</p>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkClick="popover"
        />
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--status-done)' }} />
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--status-in-progress)' }} />
          <span>In Progress</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--priority-high)' }} />
          <span>High Priority</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--danger)' }} />
          <span>Overdue</span>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false)
            setSelectedTask(null)
          }}
          onSave={handleTaskSaved}
        />
      )}
    </div>
  )
}

export default CalendarView

