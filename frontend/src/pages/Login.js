import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    const credentials =
      role === 'admin'
        ? { email: 'admin@example.com', password: 'admin123' }
        : { email: 'learner@example.com', password: 'user12345' }; // matches seed

    try {
      const result = await login(credentials.email, credentials.password);
      if (result.success) {
        toast.success(`Welcome ${role}!`);
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Demo login failed');
      }
    } catch {
      toast.error('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-visual">
          <div className="visual-content">
            <div className="cyber-logo">
              <Shield size={80} />
            </div>
            <h2 className="visual-title">Secure Access Portal</h2>
            <p className="visual-description">
              Your cybersecurity training journey continues here. Sign in to access
              interactive modules, track progress, and strengthen your security knowledge.
            </p>
            <div className="security-features">
              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <span>Advanced Security Training</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Real-world Simulations</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Progress Analytics</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1 className="auth-title" data-testid="login-title">Sign In</h1>
              <p className="auth-subtitle">Welcome back to CyberLearn Hub</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-input"
                  required
                  autoComplete="email"
                  data-testid="email-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <Lock size={16} />
                  Password
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="form-input"
                    required
                    autoComplete="current-password"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    data-testid="password-toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
                data-testid="login-submit-btn"
              >
                {loading ? <div className="loading-spinner" /> : 'Sign In'}
              </button>
            </form>

            <div className="demo-buttons" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="auth-submit-btn" onClick={() => handleDemoLogin('admin')} disabled={loading}>
                Demo Admin
              </button>
              <button className="auth-submit-btn" onClick={() => handleDemoLogin('learner')} disabled={loading}>
                Demo Learner
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link" data-testid="register-link">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
