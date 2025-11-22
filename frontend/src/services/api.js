import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const taskService = {
  getAll: (filters = {}) => {
    return api.get('/tasks', { params: filters })
  },
  getById: (id) => {
    return api.get(`/tasks/${id}`)
  },
  create: (data) => {
    return api.post('/tasks', data)
  },
  update: (id, data) => {
    return api.put(`/tasks/${id}`, data)
  },
  delete: (id) => {
    return api.delete(`/tasks/${id}`)
  }
}

export const checklistService = {
  add: (taskId, data) => {
    return api.post(`/tasks/${taskId}/checklist`, data)
  },
  update: (itemId, data) => {
    return api.put(`/checklist/${itemId}`, data)
  },
  delete: (itemId) => {
    return api.delete(`/checklist/${itemId}`)
  }
}

export const dependencyService = {
  add: (taskId, dependsOnId) => {
    return api.post(`/tasks/${taskId}/dependencies`, { depends_on_id: dependsOnId })
  },
  delete: (dependencyId) => {
    return api.delete(`/dependencies/${dependencyId}`)
  }
}

export const dashboardService = {
  getStats: () => {
    return api.get('/dashboard/stats')
  }
}

export const jiraService = {
  import: (data) => {
    return api.post('/jira/import', data)
  }
}

export default api

