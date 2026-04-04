import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, Zap, Shield, Layout } from 'lucide-react'
import './LandingPage.css'

function LandingPage() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="logo">TaskFlow</div>
                <nav className="nav-links">
                    {isAuthenticated && (
                        <Link to="/dashboard" className="nav-btn primary">Dashboard</Link>
                    )}
                </nav>
            </header>

            <main>
                <section className="hero">
                    <div className="hero-pill">Next-Gen Productivity</div>
                    <h1>Master Your Work with <span>Absolute Clarity</span></h1>
                    <p>Organize your work, track your momentum, and achieve your goals with a beautifully simple, distraction-free workspace.</p>
                    
                    <div className="cta-group">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="cta-btn primary">Launch Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/register" className="cta-btn primary">Get Started</Link>
                            </>
                        )}
                    </div>
                </section>

                <section className="features">
                    <div className="feature-card">
                        <div className="feature-icon"><Zap size={24} /></div>
                        <h3>Frictionless Flow</h3>
                        <p>Create, update, and organize tasks at the speed of thought. Zero loading screens, zero wait.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><CheckCircle size={24} /></div>
                        <h3>Deep Checklists</h3>
                        <p>Break down complex, overwhelming tasks into manageable sub-tasks with visual progress tracking.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Layout size={24} /></div>
                        <h3>Visual Architecture</h3>
                        <p>Your work mapped out intuitively. Understand priorities and dependencies at a single glance.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Shield size={24} /></div>
                        <h3>Fort Knox Security</h3>
                        <p>Your tasks are entirely private. Hardened security protocols ensure your intellectual property is safe.</p>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default LandingPage
