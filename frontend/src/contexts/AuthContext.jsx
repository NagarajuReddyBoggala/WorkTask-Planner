import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const currentToken = token || localStorage.getItem('token')
        if (currentToken && currentToken !== 'undefined' && currentToken !== 'null') {
            api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`
            localStorage.setItem('token', currentToken)

            api.get('/auth/me')
                .then(response => {
                    setUser(response.data)
                    setLoading(false)
                })
                .catch(() => {
                    logout()
                    setLoading(false)
                })
        } else {
            delete api.defaults.headers.common['Authorization']
            localStorage.removeItem('token')
            setLoading(false)
        }
    }, [])

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password })
            const { access_token, user } = response.data
            
            localStorage.setItem('token', access_token)
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            
            setToken(access_token)
            setUser(user)
            return true
        } catch (error) {
            console.error("Login failed", error)
            return false
        }
    }

    const register = async (email, password) => {
        try {
            await api.post('/auth/register', { email, password })
            return true
        } catch (error) {
            console.error("Registration failed", error)
            return false
        }
    }

    const logout = () => {
        delete api.defaults.headers.common['Authorization']
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
