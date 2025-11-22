import React, { useState, useEffect } from 'react'
import { X, Calendar, FileText, Tag, Link as LinkIcon } from 'lucide-react'
import { taskService, jiraService } from '../services/api'
import './TaskModal.css'

const TaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_date: '',
    due_date: '',
    priority: 'medium',
    status: 'todo',
    jira_id: '',
    jira_url: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assigned_date: task.assigned_date || '',
        due_date: task.due_date || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        jira_id: task.jira_id || '',
        jira_url: task.jira_url || '',
        notes: task.notes || ''
      })
    }
  }, [task])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (task) {
        await taskService.update(task.id, formData)
      } else {
        await taskService.create(formData)
      }
      onSave()
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Error saving task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImportJira = async () => {
    if (!formData.jira_id) {
      alert('Please enter a Jira ID')
      return
    }
    setLoading(true)
    try {
      await jiraService.import({
        jira_id: formData.jira_id,
        jira_url: formData.jira_url,
        title: formData.title || `Jira: ${formData.jira_id}`,
        description: formData.description,
        assigned_date: formData.assigned_date || new Date().toISOString().split('T')[0],
        due_date: formData.due_date,
        priority: formData.priority
      })
      onSave()
    } catch (error) {
      console.error('Error importing from Jira:', error)
      alert('Error importing from Jira. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">
              <FileText size={16} />
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter task description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assigned_date">
                <Calendar size={16} />
                Assigned Date
              </label>
              <input
                type="date"
                id="assigned_date"
                name="assigned_date"
                value={formData.assigned_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="due_date">
                <Calendar size={16} />
                Due Date
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">
                <Tag size={16} />
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="jira_id">
              <LinkIcon size={16} />
              Jira ID
            </label>
            <input
              type="text"
              id="jira_id"
              name="jira_id"
              value={formData.jira_id}
              onChange={handleChange}
              placeholder="e.g., PROJ-123"
            />
          </div>

          <div className="form-group">
            <label htmlFor="jira_url">Jira URL</label>
            <input
              type="url"
              id="jira_url"
              name="jira_url"
              value={formData.jira_url}
              onChange={handleChange}
              placeholder="https://jira.example.com/browse/PROJ-123"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          <div className="form-actions">
            {!task && formData.jira_id && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleImportJira}
                disabled={loading}
              >
                Import from Jira
              </button>
            )}
            <div className="form-actions-right">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : task ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal

