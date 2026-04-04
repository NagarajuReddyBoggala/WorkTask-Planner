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
  const [currentFilter, setCurrentFilter] = useState('in_progress')

  useEffect(() => {
    loadDashboardData()
  }, [currentFilter])

  const loadDashboardData = async () => {
    try {
      // Determine what filters to pass to the API based on currentFilter
      const queryParams = {}
      if (currentFilter === 'in_progress') queryParams.status = 'in_progress'
      if (currentFilter === 'done') queryParams.status = 'done'
      // For 'overdue' we might not have a direct status enum if it's computed, 
      // but let's assume the API supports `is_overdue=true` or similar, 
      // or we just fetch all and filter locally if the API doesn't support it.
      // Wait! I need to know if the backend supports overdue filtering. 
      // Let's pass the raw string and handle it, or check the backend routes first.
      // For now, I'll assume we can pass `status` for total (''), in_progress, done.
      // The backend /api/tasks supports status query params. Oh wait, what about overdue?
      // I will just fetch all tasks if currentFilter is 'overdue' or 'all' and compute locally if needed.
      const [statsRes, tasksRes] = await Promise.all([
        dashboardService.getStats(),
        taskService.getAll(currentFilter === 'all' ? {} : (currentFilter === 'overdue' ? { is_overdue: true } : { status: currentFilter }))
      ])
      
      setStats(statsRes.data)
      
      let filteredTasks = tasksRes.data;
      if (currentFilter === 'overdue') {
          // Manual fallback active filter if backend doesn't support is_overdue natively yet
          const today = new Date();
          today.setHours(0, 0, 0, 0); 
          filteredTasks = tasksRes.data.filter(t => {
              if (t.status === 'done' || !t.due_date) return false;
              const dueDate = new Date(t.due_date);
              return dueDate < today;
          });
      }
      
      // Let's not slice to 5 if the user explicitly clicked a filter, maybe show all or up to 10.
      setRecentTasks(filteredTasks.slice(0, 10))
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
      id: 'all',
      label: 'Total Tasks',
      value: stats?.total_tasks || 0,
      icon: ListChecks,
      color: 'var(--accent-primary)'
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      value: stats?.in_progress_tasks || 0,
      icon: Clock,
      color: 'var(--status-in-progress)'
    },
    {
      id: 'done',
      label: 'Completed',
      value: stats?.done_tasks || 0,
      icon: CheckCircle2,
      color: 'var(--status-done)'
    },
    {
      id: 'overdue',
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
          const isActive = currentFilter === stat.id
          return (
            <div 
              key={index} 
              className={`stat-card fade-in ${isActive ? 'active' : ''}`} 
              style={{ 
                animationDelay: `${index * 0.1}s`, 
                cursor: 'pointer',
                borderColor: isActive ? stat.color : 'var(--border-color)',
                transform: isActive ? 'translateY(-2px)' : 'none',
                boxShadow: isActive ? `0 4px 15px ${stat.color}30` : 'var(--shadow-sm)'
              }}
              onClick={() => setCurrentFilter(stat.id)}
            >
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
            <h2>
              {currentFilter === 'all' && 'All Tasks'}
              {currentFilter === 'in_progress' && 'Active Tasks'}
              {currentFilter === 'done' && 'Completed Tasks'}
              {currentFilter === 'overdue' && 'Overdue Tasks'}
            </h2>
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
                <p>
                  {stats?.total_tasks > 0 
                    ? `No ${currentFilter.replace('_', ' ')} tasks right now. Great job!` 
                    : "You haven't added any tasks yet"}
                </p>
                {stats?.total_tasks === 0 && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowTaskModal(true)}
                  >
                    Create Your First Task
                  </button>
                )}
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

