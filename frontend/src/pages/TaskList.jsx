import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { taskService } from '../services/api'
import { Plus, Filter, Search } from 'lucide-react'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import './TaskList.css'

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    date_from: '',
    date_to: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tasks, searchQuery, filters])

  const loadTasks = async () => {
    try {
      const response = await taskService.getAll()
      setTasks(response.data)
      setFilteredTasks(response.data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.jira_id?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status)
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    // Date filters
    if (filters.date_from) {
      filtered = filtered.filter(task => 
        task.assigned_date && task.assigned_date >= filters.date_from
      )
    }

    if (filters.date_to) {
      filtered = filtered.filter(task => 
        task.assigned_date && task.assigned_date <= filters.date_to
      )
    }

    setFilteredTasks(filtered)
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      date_from: '',
      date_to: ''
    })
    setSearchQuery('')
  }

  const handleTaskSaved = () => {
    setShowTaskModal(false)
    loadTasks()
  }

  if (loading) {
    return <div className="loading">Loading tasks...</div>
  }

  return (
    <div className="task-list-page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="subtitle">Manage all your work tasks</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowTaskModal(true)}
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>

          <button
            className="btn btn-secondary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="tasks-grid">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onUpdate={loadTasks} />
          ))
        ) : (
          <div className="empty-state">
            <p>No tasks found</p>
            {searchQuery || Object.values(filters).some(f => f) ? (
              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => setShowTaskModal(true)}
              >
                Create Your First Task
              </button>
            )}
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          onClose={() => setShowTaskModal(false)}
          onSave={handleTaskSaved}
        />
      )}
    </div>
  )
}

export default TaskList

