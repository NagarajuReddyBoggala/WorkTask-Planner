import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import './TaskCard.css'

const TaskCard = ({ task, onUpdate }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'var(--priority-urgent)'
      case 'high': return 'var(--priority-high)'
      case 'medium': return 'var(--priority-medium)'
      case 'low': return 'var(--priority-low)'
      default: return 'var(--priority-medium)'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return CheckCircle2
      case 'in_progress': return Clock
      case 'blocked': return XCircle
      default: return AlertCircle
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'var(--status-done)'
      case 'in_progress': return 'var(--status-in-progress)'
      case 'blocked': return 'var(--status-blocked)'
      default: return 'var(--status-todo)'
    }
  }

  const StatusIcon = getStatusIcon(task.status)
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
  const progress = task.checklist_count > 0 
    ? (task.completed_checklist_count / task.checklist_count) * 100 
    : 0

  return (
    <Link to={`/tasks/${task.id}`} className="task-card">
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-badges">
          <span 
            className="priority-badge"
            style={{ backgroundColor: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
          <span 
            className="status-badge"
            style={{ backgroundColor: `${getStatusColor(task.status)}20`, color: getStatusColor(task.status) }}
          >
            <StatusIcon size={14} />
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.assigned_date && (
        <div className="task-date">
          <Calendar size={16} />
          <span>{format(new Date(task.assigned_date), 'MMM dd, yyyy')}</span>
          {isOverdue && (
            <span className="overdue-indicator">Overdue</span>
          )}
        </div>
      )}

      {task.checklist_count > 0 && (
        <div className="task-progress">
          <div className="progress-info">
            <span>Checklist: {task.completed_checklist_count}/{task.checklist_count}</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="progress-bar-mini">
            <div 
              className="progress-fill-mini"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {task.jira_id && (
        <div className="task-jira">
          <span className="jira-badge">Jira: {task.jira_id}</span>
        </div>
      )}
    </Link>
  )
}

export default TaskCard

