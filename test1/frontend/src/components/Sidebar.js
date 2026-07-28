import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Shield, 
  FileText, 
  BarChart3, 
  Settings,
  Target,
  AlertTriangle
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['admin', 'learner']
    },
    {
      name: 'Training Modules',
      icon: GraduationCap,
      path: '/training',
      roles: ['admin', 'learner']
    },
    {
      name: 'Simulations',
      icon: Target,
      path: '/simulations',
      roles: ['admin', 'learner']
    },
    {
      name: 'Policies',
      icon: FileText,
      path: '/policies',
      roles: ['admin', 'learner']
    },
    {
      name: 'Reports',
      icon: BarChart3,
      path: '/reports',
      roles: ['admin', 'learner']
    },
    {
      name: 'Admin Panel',
      icon: Settings,
      path: '/admin',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                data-testid={`sidebar-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <Icon size={20} />
                <span className="sidebar-text">{item.name}</span>
                {isActive && <div className="active-indicator" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="security-tip">
            <AlertTriangle size={16} className="tip-icon" />
            <div className="tip-content">
              <div className="tip-title">Security Tip</div>
              <div className="tip-text">
                Always verify sender identity before clicking email links.
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;