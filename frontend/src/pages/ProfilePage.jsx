import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { User, Lock, Trash2, Check, AlertCircle } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, logout, login } = useAuth(); // login not strictly needed here unless we re-auth, but logout is
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    
    // Passwords
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Status
    const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
    const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const getInitials = (name, email) => {
        if (name) {
            const parts = name.split(' ');
            if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
            return name.substring(0, 2).toUpperCase();
        }
        if (email) return email.substring(0, 2).toUpperCase();
        return 'U';
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setProfileStatus({ type: '', message: '' });
        
        try {
            const res = await authService.updateProfile({ full_name: fullName });
            setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
            // Ideally Context might need refreshing if it displays name, 
            // but we can just rely on the API updating state.
        } catch (error) {
            setProfileStatus({ type: 'error', message: 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordStatus({ type: '', message: '' });
        
        if (newPassword !== confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }
        
        setIsSaving(true);
        try {
            await authService.updatePassword({ 
                current_password: currentPassword, 
                new_password: newPassword 
            });
            setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const msg = error.response?.data?.msg || 'Failed to update password.';
            setPasswordStatus({ type: 'error', message: msg });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you ABSOLUTELY sure? This will delete your account, your tasks, and all data forever. This action cannot be undone.')) {
            try {
                await authService.deleteAccount();
                logout(); // Log the user out completely to redirect them to login/register
            } catch (error) {
                alert('Failed to delete account. Please try again.');
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Profile & Settings</h1>
                <p>Manage your account settings and preferences</p>
            </div>

            <div className="profile-content">
                {/* Personal Information */}
                <section className="settings-section">
                    <h2><User size={20} /> Personal Information</h2>
                    
                    <div className="avatar-section">
                        <div className="avatar-circle">
                            {getInitials(fullName, email)}
                        </div>
                        <div className="avatar-info">
                            <h3>{fullName || 'Add your name'}</h3>
                            <p>{email}</p>
                        </div>
                    </div>

                    <form className="settings-form" onSubmit={handleProfileSubmit}>
                        {profileStatus.message && (
                            <div className={`alert-message ${profileStatus.type}`}>
                                {profileStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                {profileStatus.message}
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                placeholder="e.g. Jane Doe"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" value={email} disabled />
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </section>

                {/* Password Change */}
                <section className="settings-section">
                    <h2><Lock size={20} /> Security</h2>
                    <form className="settings-form" onSubmit={handlePasswordSubmit}>
                        {passwordStatus.message && (
                            <div className={`alert-message ${passwordStatus.type}`}>
                                {passwordStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                                {passwordStatus.message}
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label>Current Password</label>
                            <input 
                                type="password" 
                                value={currentPassword} 
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)}
                                required 
                                minLength="6"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                                minLength="6"
                            />
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                Update Password
                            </button>
                        </div>
                    </form>
                </section>

                {/* Danger Zone */}
                <section className="settings-section danger">
                    <h2><Trash2 size={20} /> Danger Zone</h2>
                    <div className="danger-content">
                        <p>
                            Once you delete your account, there is no going back. Please be certain.
                            All your tasks, checklists, and dependencies will be permanently erased.
                        </p>
                        <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;
