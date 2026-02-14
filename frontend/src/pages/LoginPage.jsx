import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const success = await login(email, password)
        if (success) {
            navigate('/dashboard')
        } else {
            setError('Failed to login. Please check your credentials.')
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Sign In</h2>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">Sign In</button>
                </form>
                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </div>
                <div className="auth-footer">
                    <Link to="/">Back to Home</Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
