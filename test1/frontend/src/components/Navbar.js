import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, LogOut, Bell, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // This will be fetched from API

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <Shield className="navbar-logo" />
          <span className="navbar-title">CyberLearn Hub</span>
        </Link>

        <div className="navbar-actions">
          <ThemeToggle />
          
          <button 
            className="notification-btn" 
            data-testid="notification-button"
            onClick={() => setNotificationOpen(!notificationOpen)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          <div className="user-dropdown">
            <button 
              className="user-button" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              data-testid="user-menu-button"
            >
              <User size={20} />
              <span className="user-name">{user?.full_name}</span>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu" data-testid="user-dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-name-dropdown">{user?.full_name}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                  <div className={`role-badge ${user?.role}`}>{user?.role}</div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                {user.role === 'admin' ? (
                  <Link 
                    to="/admin/profile" 
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                    data-testid="admin-profile-link"
                  >
                    <User size={16} />
                    Admin Profile
                  </Link>
                ) : (
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                    data-testid="profile-link"
                  >
                    <User size={16} />
                    Profile
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout} 
                  className="dropdown-item logout-item"
                  data-testid="logout-button"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={notificationOpen} 
        onClose={() => setNotificationOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </nav>
  );
};

export default Navbar;