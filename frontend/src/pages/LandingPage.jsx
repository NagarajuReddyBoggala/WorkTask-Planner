import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LandingPage.css'

function LandingPage() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="logo">WorkTask Planner</div>
                <nav>
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="nav-btn primary">Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn">Sign In</Link>
                            <Link to="/register" className="nav-btn primary">Sign Up</Link>
                        </>
                    )}
                </nav>
            </header>

            <main>
                <section className="hero">
                    <h1>Manage Your Tasks with Efficiency and Style</h1>
                    <p>Organize your work, track progress, and collaborate seamlessly with our intuitive task planner.</p>
                    {!isAuthenticated && (
                        <div className="cta-group">
                            <Link to="/register" className="cta-btn primary">Get Started for Free</Link>
                            <Link to="/login" className="cta-btn secondary">Log In</Link>
                        </div>
                    )}
                    {isAuthenticated && (
                        <div className="cta-group">
                            <Link to="/dashboard" className="cta-btn primary">Go to Dashboard</Link>
                        </div>
                    )}
                </section>

                <section className="features">
                    <div className="feature-card">
                        <h3>Task Management</h3>
                        <p>Create, update, and organize tasks with ease. Set priorities and due dates.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Checklists</h3>
                        <p>Break down complex tasks into manageable sub-tasks with progress tracking.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Dependencies</h3>
                        <p>Link tasks together and visualize workflow dependencies effectively.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Private & Secure</h3>
                        <p>Your tasks are private to your account. Secure authentication keeps your data safe.</p>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} WorkTask Planner. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default LandingPage
