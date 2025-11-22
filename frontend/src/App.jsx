import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CalendarView from './pages/CalendarView'
import TaskList from './pages/TaskList'
import TaskDetail from './pages/TaskDetail'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App

