import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService, taskService } from '../services/api'
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, 
  Calendar, ListChecks, Plus, ArrowRight 
} from 'lucide-react'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        dashboardService.getStats(),
        taskService.getAll({ status: 'in_progress' })
      ])
      setStats(statsRes.data)
      setRecentTasks(tasksRes.data.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = () => {
    setShowTaskModal(false)
    loadDashboardData()
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats?.total_tasks || 0,
      icon: ListChecks,
      color: 'var(--accent-primary)'
    },
    {
      label: 'In Progress',
      value: stats?.in_progress_tasks || 0,
      icon: Clock,
      color: 'var(--status-in-progress)'
    },
    {
      label: 'Completed',
      value: stats?.done_tasks || 0,
      icon: CheckCircle2,
      color: 'var(--status-done)'
    },
    {
      label: 'Overdue',
      value: stats?.overdue_tasks || 0,
      icon: AlertCircle,
      color: 'var(--danger)'
    }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Overview of your work tasks and progress</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowTaskModal(true)}
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="stat-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Active Tasks</h2>
            <Link to="/tasks" className="link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="tasks-list">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <TaskCard key={task.id} task={task} onUpdate={loadDashboardData} />
              ))
            ) : (
              <div className="empty-state">
                <ListChecks size={48} />
                <p>No active tasks</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowTaskModal(true)}
                >
                  Create Your First Task
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Progress Overview</h2>
          </div>
          <div className="progress-section">
            <div className="progress-item">
              <div className="progress-header">
                <span>Checklist Completion</span>
                <span className="progress-percent">
                  {stats?.checklist_completion_rate?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${stats?.checklist_completion_rate || 0}%` }}
                />
              </div>
            </div>
            <div className="progress-item">
              <div className="progress-header">
                <span>Task Completion</span>
                <span className="progress-percent">
                  {stats?.total_tasks > 0 
                    ? ((stats?.done_tasks / stats?.total_tasks) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${stats?.total_tasks > 0 
                      ? (stats?.done_tasks / stats?.total_tasks) * 100
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          onClose={() => setShowTaskModal(false)}
          onSave={handleTaskCreated}
        />
      )}
    </div>
  )
}

export default Dashboard

