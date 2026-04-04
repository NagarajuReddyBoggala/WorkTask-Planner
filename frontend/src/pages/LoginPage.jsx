import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
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
            setError('Invalid credentials. Please verify your email and password.')
        }
    }

    return (
        <div className="auth-container">
            <Link to="/" className="back-home">
                <ArrowLeft size={18} /> Home
            </Link>

            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Log in to enter your workspace.</p>
                
                {error && <div className="auth-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-icon-wrapper">
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Mail size={18} className="input-icon" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="has-toggle"
                            />
                            <Lock size={18} className="input-icon" />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-button">Sign In</button>
                </form>

                <div className="auth-footer">
                    <span>Don't have an account? <Link to="/register">Join now</Link></span>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
