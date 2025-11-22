import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun, Home, Calendar, List, Plus, Search } from 'lucide-react'
import './Layout.css'

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/tasks', icon: List, label: 'Tasks' }
  ]

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>WorkTask Planner</h1>
        </div>
        
        <div className="nav-links">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="nav-actions">
          <button
            className="icon-button"
            onClick={() => setShowSearch(!showSearch)}
            title="Search"
          >
            <Search size={20} />
          </button>
          <button
            className="icon-button"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </nav>

      {showSearch && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout

