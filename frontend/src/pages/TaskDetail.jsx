import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { taskService, checklistService, dependencyService } from '../services/api'
import { 
  ArrowLeft, Edit, Trash2, Plus, CheckCircle2, Circle,
  Calendar, Tag, Link as LinkIcon, FileText, GitBranch,
  AlertCircle, X
} from 'lucide-react'
import { format } from 'date-fns'
import TaskModal from '../components/TaskModal'
import './TaskDetail.css'

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showChecklistForm, setShowChecklistForm] = useState(false)
  const [showDependencyForm, setShowDependencyForm] = useState(false)
  const [newChecklistItem, setNewChecklistItem] = useState({
    title: '',
    stage: 'development',
    git_branch: ''
  })
  const [availableTasks, setAvailableTasks] = useState([])

  useEffect(() => {
    loadTask()
    loadAvailableTasks()
  }, [id])

  const loadTask = async () => {
    try {
      const response = await taskService.getById(id)
      setTask(response.data)
    } catch (error) {
      console.error('Error loading task:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableTasks = async () => {
    try {
      const response = await taskService.getAll()
      setAvailableTasks(response.data.filter(t => t.id !== parseInt(id)))
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(id)
        navigate('/tasks')
      } catch (error) {
        console.error('Error deleting task:', error)
        alert('Error deleting task. Please try again.')
      }
    }
  }

  const handleAddChecklistItem = async (e) => {
    e.preventDefault()
    try {
      await checklistService.add(id, newChecklistItem)
      setNewChecklistItem({ title: '', stage: 'development', git_branch: '' })
      setShowChecklistForm(false)
      loadTask()
    } catch (error) {
      console.error('Error adding checklist item:', error)
      alert('Error adding checklist item. Please try again.')
    }
  }

  const handleToggleChecklistItem = async (item) => {
    try {
      await checklistService.update(item.id, { ...item, completed: !item.completed })
      loadTask()
    } catch (error) {
      console.error('Error updating checklist item:', error)
    }
  }

  const handleDeleteChecklistItem = async (itemId) => {
    try {
      await checklistService.delete(itemId)
      loadTask()
    } catch (error) {
      console.error('Error deleting checklist item:', error)
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(task.checklist_items)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order for all items
    const updates = items.map((item, index) => ({
      ...item,
      order: index
    }))

    // Update all items in order
    for (const item of updates) {
      await checklistService.update(item.id, { order: item.order })
    }

    loadTask()
  }

  const handleAddDependency = async (dependsOnId) => {
    try {
      await dependencyService.add(id, dependsOnId)
      setShowDependencyForm(false)
      loadTask()
    } catch (error) {
      console.error('Error adding dependency:', error)
      alert('Error adding dependency. Please try again.')
    }
  }

  const handleRemoveDependency = async (dependencyId) => {
    try {
      await dependencyService.delete(dependencyId)
      loadTask()
    } catch (error) {
      console.error('Error removing dependency:', error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'var(--priority-urgent)'
      case 'high': return 'var(--priority-high)'
      case 'medium': return 'var(--priority-medium)'
      case 'low': return 'var(--priority-low)'
      default: return 'var(--priority-medium)'
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

  if (loading) {
    return <div className="loading">Loading task...</div>
  }

  if (!task) {
    return <div className="error">Task not found</div>
  }

  const progress = task.checklist_items.length > 0
    ? (task.checklist_items.filter(item => item.completed).length / task.checklist_items.length) * 100
    : 0

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <Link to="/tasks" className="back-button">
          <ArrowLeft size={20} />
          Back to Tasks
        </Link>
        <div className="task-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowTaskModal(true)}
          >
            <Edit size={18} />
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="task-detail-content">
        <div className="task-main">
          <div className="task-title-section">
            <h1>{task.title}</h1>
            <div className="task-badges">
              <span
                className="badge"
                style={{ backgroundColor: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority) }}
              >
                <Tag size={14} />
                {task.priority}
              </span>
              <span
                className="badge"
                style={{ backgroundColor: `${getStatusColor(task.status)}20`, color: getStatusColor(task.status) }}
              >
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {task.description && (
            <div className="task-section">
              <h3>
                <FileText size={18} />
                Description
              </h3>
              <p>{task.description}</p>
            </div>
          )}

          <div className="task-meta">
            {task.assigned_date && (
              <div className="meta-item">
                <Calendar size={18} />
                <div>
                  <span className="meta-label">Assigned Date</span>
                  <span className="meta-value">
                    {format(new Date(task.assigned_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            )}
            {task.due_date && (
              <div className="meta-item">
                <Calendar size={18} />
                <div>
                  <span className="meta-label">Due Date</span>
                  <span className="meta-value">
                    {format(new Date(task.due_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            )}
            {task.jira_id && (
              <div className="meta-item">
                <LinkIcon size={18} />
                <div>
                  <span className="meta-label">Jira</span>
                  <span className="meta-value">
                    {task.jira_id}
                    {task.jira_url && (
                      <a href={task.jira_url} target="_blank" rel="noopener noreferrer">
                        Open
                      </a>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {task.notes && (
            <div className="task-section">
              <h3>Notes</h3>
              <p>{task.notes}</p>
            </div>
          )}

          {task.dependencies && task.dependencies.length > 0 && (
            <div className="task-section">
              <h3>Dependencies</h3>
              <div className="dependencies-list">
                {task.dependencies.map(dep => (
                  <div key={dep.id} className="dependency-item">
                    <Link to={`/tasks/${dep.id}`}>{dep.title}</Link>
                    <span className="dependency-status" style={{ color: getStatusColor(dep.status) }}>
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="task-section">
            <div className="section-header">
              <h3>
                <CheckCircle2 size={18} />
                Checklist ({task.checklist_items.filter(item => item.completed).length}/{task.checklist_items.length})
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowChecklistForm(!showChecklistForm)}
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            {progress > 0 && (
              <div className="checklist-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span>{progress.toFixed(0)}% Complete</span>
              </div>
            )}

            {showChecklistForm && (
              <form onSubmit={handleAddChecklistItem} className="checklist-form">
                <input
                  type="text"
                  placeholder="Checklist item title"
                  value={newChecklistItem.title}
                  onChange={(e) => setNewChecklistItem({ ...newChecklistItem, title: e.target.value })}
                  required
                />
                <select
                  value={newChecklistItem.stage}
                  onChange={(e) => setNewChecklistItem({ ...newChecklistItem, stage: e.target.value })}
                >
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="merge">Merge</option>
                  <option value="deployment">Deployment</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Git branch (optional)"
                  value={newChecklistItem.git_branch}
                  onChange={(e) => setNewChecklistItem({ ...newChecklistItem, git_branch: e.target.value })}
                />
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary btn-sm">Add</button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setShowChecklistForm(false)
                      setNewChecklistItem({ title: '', stage: 'development', git_branch: '' })
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="checklist">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="checklist">
                    {task.checklist_items.length === 0 ? (
                      <div className="empty-checklist">
                        <p>No checklist items yet. Add one to get started!</p>
                      </div>
                    ) : (
                      task.checklist_items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`checklist-item ${snapshot.isDragging ? 'dragging' : ''} ${item.completed ? 'completed' : ''}`}
                            >
                              <button
                                className="checklist-checkbox"
                                onClick={() => handleToggleChecklistItem(item)}
                              >
                                {item.completed ? (
                                  <CheckCircle2 size={20} />
                                ) : (
                                  <Circle size={20} />
                                )}
                              </button>
                              <div className="checklist-content">
                                <span className="checklist-title">{item.title}</span>
                                <div className="checklist-meta">
                                  {item.stage && (
                                    <span className="checklist-stage">{item.stage}</span>
                                  )}
                                  {item.git_branch && (
                                    <span className="checklist-branch">
                                      <GitBranch size={14} />
                                      {item.git_branch}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                className="checklist-delete"
                                onClick={() => handleDeleteChecklistItem(item.id)}
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          task={task}
          onClose={() => setShowTaskModal(false)}
          onSave={() => {
            setShowTaskModal(false)
            loadTask()
          }}
        />
      )}
    </div>
  )
}

export default TaskDetail

