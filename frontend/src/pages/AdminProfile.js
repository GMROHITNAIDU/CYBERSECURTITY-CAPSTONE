import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  User,
  Lock,
  Shield,
  Settings,
  Bell,
  Eye,
  EyeOff,
  Save,
  QrCode,
  Smartphone,
  Mail,
  Key,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import './AdminProfile.css';

// --- helpers ---
const safeStr = (v) => (v ?? '');
const safeBool = (v) => Boolean(v);
const safeDateStr = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

const AdminProfile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    role: '',
    created_at: ''
  });

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // 2FA
  const [twoFAData, setTwoFAData] = useState({
    enabled: false,
    qr_code: '',
    setup_code: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [show2FASetup, setShow2FASetup] = useState(false);

  // Preferences
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    dashboard_notifications: true,
    security_alerts: true,
    weekly_reports: false,
    theme: 'light'
  });

  // Forgot password
  const [forgotPassword, setForgotPassword] = useState({
    email: '',
    resetToken: '',
    newPassword: '',
    confirmNewPassword: '',
    step: 1
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetch2FAStatus();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/profile');
      const u = response.data || {};
      setProfileData({
        full_name: safeStr(u.name),
        email: safeStr(u.email),
        role: safeStr(u.role),
        created_at: safeStr(u.createdAt)
      });
      setPreferences((prev) => ({ ...prev, theme }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileData((p) => ({
        full_name: safeStr(p.full_name),
        email: safeStr(p.email),
        role: safeStr(p.role),
        created_at: safeStr(p.created_at)
      }));
      toast.error('Failed to load profile data');
    }
  };

  const fetch2FAStatus = async () => {
    try {
      const response = await axios.get('/auth/2fa-status');
      setTwoFAData((prev) => ({
        ...prev,
        enabled: response.data.enabled
      }));
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  // --- Submit handlers wrapped to use <form> properly ---

  const onSubmitProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put('/profile', {
        name: profileData.full_name,
        email: profileData.email
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/change-password', {
        currentPassword: passwordForm.current_password,
        newPassword: passwordForm.new_password
      });
      toast.success('Password changed successfully');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/setup-2fa');
      setTwoFAData({
        enabled: false,
        qr_code: response.data.qrDataUrl || '',
        setup_code: response.data.otpauth || ''
      });
      setShow2FASetup(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setLoading(true);
      await axios.post('/auth/verify-2fa', { token: otpCode });
      setTwoFAData((prev) => ({ ...prev, enabled: true }));
      setShow2FASetup(false);
      setOtpCode('');
      toast.success('2FA enabled successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Disable 2FA? This reduces account security.')) return;
    try {
      setLoading(true);
      await axios.post('/auth/disable-2fa');
      setTwoFAData((prev) => ({ ...prev, enabled: false }));
      toast.success('2FA disabled successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/auth/forgot-password', {
        email: forgotPassword.email
      });
      setForgotPassword((prev) => ({ ...prev, step: 2 }));
      toast.success('Reset code sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (forgotPassword.newPassword !== forgotPassword.confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/auth/reset-password', {
        email: forgotPassword.email,
        newPassword: forgotPassword.newPassword
      });
      toast.success('Password reset successfully');
      setShowForgotPassword(false);
      setForgotPassword({
        email: '',
        resetToken: '',
        newPassword: '',
        confirmNewPassword: '',
        step: 1
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setLoading(true);
      if (preferences.theme !== theme) {
        toggleTheme();
      }
      toast.success('Preferences updated successfully');
    } catch {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security Settings', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="admin-profile">
      <div className="profile-header">
        <div className="header-content">
          <h1 className="page-title">Admin Profile</h1>
          <p className="page-subtitle">Manage your account settings and preferences</p>
        </div>

        <div className="profile-avatar">
          <div className="avatar-circle">
            <User size={32} />
          </div>
          <div className="avatar-info">
            <div className="avatar-name">{profileData.full_name}</div>
            <div className="avatar-role">System Administrator</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Profile Information */}
        {activeTab === 'profile' && (
          <div className="tab-section">
            <h3>Profile Information</h3>
            <form className="form-grid" onSubmit={onSubmitProfile} autoComplete="on">
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={safeStr(profileData.full_name)}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={safeStr(profileData.email)}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  value={safeStr(profileData.role)}
                  disabled
                  className="disabled-input"
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="member_since">Member Since</label>
                <input
                  id="member_since"
                  name="member_since"
                  type="text"
                  value={safeDateStr(profileData.created_at)}
                  disabled
                  className="disabled-input"
                  autoComplete="off"
                />
              </div>

              <div className="form-actions">
                <button className="btn-primary" type="submit" disabled={loading}>
                  <Save size={16} />
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="tab-section">
            <div className="security-section">
              <h3>Change Password</h3>

              {/* IMPORTANT: wrap in a form */}
              <form className="form-grid" onSubmit={onSubmitPasswordChange} autoComplete="on">
                <div className="form-group">
                  <label htmlFor="current_password">Current Password</label>
                  <div className="password-input">
                    <input
                      id="current_password"
                      name="current_password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={safeStr(passwordForm.current_password)}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, current_password: e.target.value })
                      }
                      placeholder="Enter current password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="password-toggle"
                      aria-label="Toggle current password visibility"
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <div className="password-input">
                    <input
                      id="new_password"
                      name="new_password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={safeStr(passwordForm.new_password)}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password: e.target.value })
                      }
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="password-toggle"
                      aria-label="Toggle new password visibility"
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm New Password</label>
                  <div className="password-input">
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={safeStr(passwordForm.confirm_password)}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                      }
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="password-toggle"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-primary" type="submit" disabled={loading}>
                    <Lock size={16} />
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    <Mail size={16} />
                    Forgot Password
                  </button>
                </div>
              </form>
            </div>

            <div className="security-section">
              <h3>Two-Factor Authentication</h3>
              <div className="twofa-status">
                <div className="status-indicator">
                  {twoFAData.enabled ? (
                    <CheckCircle size={20} className="status-enabled" />
                  ) : (
                    <AlertCircle size={20} className="status-disabled" />
                  )}
                  <span>2FA is {twoFAData.enabled ? 'enabled' : 'disabled'}</span>
                </div>

                <div className="twofa-actions">
                  {twoFAData.enabled ? (
                    <button
                      className="btn-danger"
                      type="button"
                      onClick={handleDisable2FA}
                      disabled={loading}
                    >
                      <X size={16} />
                      Disable 2FA
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      type="button"
                      onClick={handleSetup2FA}
                      disabled={loading}
                    >
                      <QrCode size={16} />
                      Enable 2FA
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeTab === 'preferences' && (
          <div className="tab-section">
            <h3>Appearance</h3>
            <div className="preference-group">
              <div className="preference-item">
                <div className="preference-info">
                  <label>Theme</label>
                  <span>Choose your preferred theme</span>
                </div>
                <div className="preference-control">
                  <button
                    type="button"
                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => theme !== 'light' && toggleTheme()}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => theme !== 'dark' && toggleTheme()}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>

            <h3>Notifications</h3>
            <div className="preference-group">
              <div className="preference-item">
                <div className="preference-info">
                  <label htmlFor="pref_email_notif">Email Notifications</label>
                  <span>Receive notifications via email</span>
                </div>
                <div className="preference-control">
                  <label className="switch">
                    <input
                      id="pref_email_notif"
                      type="checkbox"
                      checked={safeBool(preferences.email_notifications)}
                      onChange={(e) =>
                        setPreferences({ ...preferences, email_notifications: e.target.checked })
                      }
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <label htmlFor="pref_dash_notif">Dashboard Notifications</label>
                  <span>Show notifications in dashboard</span>
                </div>
                <div className="preference-control">
                  <label className="switch">
                    <input
                      id="pref_dash_notif"
                      type="checkbox"
                      checked={safeBool(preferences.dashboard_notifications)}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          dashboard_notifications: e.target.checked
                        })
                      }
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <label htmlFor="pref_security_alerts">Security Alerts</label>
                  <span>Get notified about security events</span>
                </div>
                <div className="preference-control">
                  <label className="switch">
                    <input
                      id="pref_security_alerts"
                      type="checkbox"
                      checked={safeBool(preferences.security_alerts)}
                      onChange={(e) =>
                        setPreferences({ ...preferences, security_alerts: e.target.checked })
                      }
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={handlePreferencesUpdate}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="tab-section">
            <h3>Notification Settings</h3>
            <p className="section-description">
              Manage how and when you receive notifications about system events and user activities.
            </p>

            <div className="notification-preview">
              <div className="notification-item">
                <Bell size={16} />
                <div className="notification-content">
                  <div className="notification-title">Sample Notification</div>
                  <div className="notification-description">
                    This is how notifications will appear in your dashboard
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <div className="modal-overlay" onClick={() => setShow2FASetup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Setup Two-Factor Authentication</h3>
              <button type="button" onClick={() => setShow2FASetup(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="twofa-setup">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Scan QR Code</h4>
                    <p>Use your authenticator app to scan this QR code:</p>
                    {twoFAData.qr_code && (
                      <img className="qr-code" alt="2FA QR" src={twoFAData.qr_code} />
                    )}
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Enter Verification Code</h4>
                    <p>Enter the 6-digit code from your authenticator app:</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={safeStr(otpCode)}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="otp-input"
                      autoComplete="one-time-code"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setShow2FASetup(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerify2FA}
                className="btn-primary"
                disabled={loading || otpCode.length !== 6}
              >
                <Smartphone size={16} />
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button type="button" onClick={() => setShowForgotPassword(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              {forgotPassword.step === 1 ? (
                <form className="forgot-step" onSubmit={handleForgotPasswordRequest} autoComplete="on">
                  <p>Enter your email address and we'll send you a reset code.</p>
                  <div className="form-group">
                    <label htmlFor="forgot_email">Email Address</label>
                    <input
                      id="forgot_email"
                      type="email"
                      value={safeStr(forgotPassword.email)}
                      onChange={(e) =>
                        setForgotPassword({ ...forgotPassword, email: e.target.value })
                      }
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowForgotPassword(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      <Key size={16} />
                      {loading ? 'Processing...' : 'Send Code'}
                    </button>
                  </div>
                </form>
              ) : (
                <form className="forgot-step" onSubmit={handlePasswordReset} autoComplete="on">
                  <p>Enter the reset code sent to your email and your new password.</p>
                  <div className="form-group">
                    <label htmlFor="reset_code">Reset Code</label>
                    <input
                      id="reset_code"
                      type="text"
                      value={safeStr(forgotPassword.resetToken)}
                      onChange={(e) =>
                        setForgotPassword({ ...forgotPassword, resetToken: e.target.value })
                      }
                      placeholder="Enter reset code"
                      autoComplete="one-time-code"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reset_new_password">New Password</label>
                    <input
                      id="reset_new_password"
                      type="password"
                      value={safeStr(forgotPassword.newPassword)}
                      onChange={(e) =>
                        setForgotPassword({ ...forgotPassword, newPassword: e.target.value })
                      }
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reset_confirm_password">Confirm Password</label>
                    <input
                      id="reset_confirm_password"
                      type="password"
                      value={safeStr(forgotPassword.confirmNewPassword)}
                      onChange={(e) =>
                        setForgotPassword({
                          ...forgotPassword,
                          confirmNewPassword: e.target.value
                        })
                      }
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowForgotPassword(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      <Key size={16} />
                      {loading ? 'Processing...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
