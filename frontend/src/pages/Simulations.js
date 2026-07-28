import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Target, 
  Clock, 
  Users, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Globe,
  Plus,
  Filter,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import './Simulations.css';

const Simulations = () => {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSimulations();
  }, [user]);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'admin' ? '/simulations' : '/simulations/my';
      const response = await axios.get(endpoint);
      setSimulations(response.data);
    } catch (error) {
      console.error('Error fetching simulations:', error);
      toast.error('Failed to load simulations');
    } finally {
      setLoading(false);
    }
  };

  const getSimulationIcon = (type) => {
    switch (type) {
      case 'phishing_email':
        return <Mail className="simulation-icon" />;
      case 'social_call':
        return <Phone className="simulation-icon" />;
      case 'malicious_website':
        return <Globe className="simulation-icon" />;
      default:
        return <Target className="simulation-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-scheduled';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSimulations = simulations.filter(simulation => {
    if (filter === 'all') return true;
    return simulation.status === filter;
  });

  if (loading) {
    return (
      <div className="simulations-loading">
        <div className="loading-spinner"></div>
        <p>Loading simulations...</p>
      </div>
    );
  }

  return (
    <div className="simulations-page" data-testid="simulations-page">
      {/* Header */}
      <div className="simulations-header">
        <div className="header-content">
          <h1 className="page-title">Security Simulations</h1>
          <p className="page-subtitle">
            {user?.role === 'admin' 
              ? 'Create and manage realistic cybersecurity attack simulations'
              : 'Practice defending against real-world cyber threats'
            }
          </p>
        </div>

        {user?.role === 'admin' && (
          <button 
            className="create-simulation-btn"
            onClick={() => setShowCreateModal(true)}
            data-testid="create-simulation-btn"
          >
            <Plus size={16} />
            Create Simulation
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="simulations-stats">
        <div className="stat-card">
          <div className="stat-icon scheduled">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {simulations.filter(s => s.status === 'scheduled').length}
            </div>
            <div className="stat-label">Scheduled</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <Target size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {simulations.filter(s => s.status === 'active').length}
            </div>
            <div className="stat-label">Active</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {simulations.filter(s => s.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="stat-card">
            <div className="stat-icon analytics">
              <BarChart3 size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{simulations.length}</div>
              <div className="stat-label">Total Simulations</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="simulations-filters">
        <div className="filter-container">
          <Filter size={16} className="filter-icon" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
            data-testid="status-filter"
          >
            <option value="all">All Simulations</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Simulations Grid */}
      <div className="simulations-grid">
        {filteredSimulations.length > 0 ? (
          filteredSimulations.map((simulation, index) => (
            <div 
              key={simulation.id} 
              className={`simulation-card ${simulation.status}`}
              data-testid={`simulation-card-${index}`}
            >
              <div className="simulation-header">
                <div className="simulation-type">
                  {getSimulationIcon(simulation.scenario_type)}
                  <span className="type-text">
                    {(simulation.scenario_type || 'phishing_email').replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className={`status-badge ${getStatusColor(simulation.status)}`}>
                  {simulation.status.toUpperCase()}
                </div>
              </div>

              <div className="simulation-content">
                <h3 className="simulation-title">{simulation.title}</h3>
                <p className="simulation-description">{simulation.description}</p>

                <div className="simulation-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{formatDate(simulation.scheduled_at)}</span>
                  </div>
                  
                  <div className="meta-item">
                    <Users size={14} />
                    <span>
                      {simulation.target_users.length === 0 
                        ? 'All users' 
                        : `${simulation.target_users.length} users`
                      }
                    </span>
                  </div>
                </div>

                {simulation.results && simulation.results.length > 0 && (
                  <div className="simulation-results">
                    <div className="results-summary">
                      <span className="results-label">Results:</span>
                      <span className="results-stats">
                        {simulation.results.filter(r => r.detected).length} detected / {simulation.results.length} total
                      </span>
                    </div>
                    <div className="success-rate">
                      Detection Rate: {Math.round((simulation.results.filter(r => r.detected).length / simulation.results.length) * 100)}%
                    </div>
                  </div>
                )}
              </div>

              <div className="simulation-actions">
                {simulation.status === 'scheduled' && (
                  <button 
                    className="action-btn primary"
                    data-testid={`start-simulation-${index}`}
                  >
                    <Play size={16} />
                    Start Simulation
                  </button>
                )}
                
                {simulation.status === 'active' && (
                  <button 
                    className="action-btn secondary"
                    data-testid={`view-progress-${index}`}
                  >
                    <BarChart3 size={16} />
                    View Progress
                  </button>
                )}
                
                {simulation.status === 'completed' && (
                  <button 
                    className="action-btn tertiary"
                    data-testid={`view-results-${index}`}
                  >
                    <CheckCircle size={16} />
                    View Results
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Target size={64} />
            <h3>No simulations found</h3>
            <p>
              {filter !== 'all' 
                ? `No ${filter} simulations available`
                : user?.role === 'admin' 
                  ? 'Create your first security simulation to get started'
                  : 'No simulations have been created for you yet'
              }
            </p>
            {user?.role === 'admin' && filter === 'all' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create First Simulation
              </button>
            )}
          </div>
        )}
      </div>

      {/* Simulation Types Info */}
      {simulations.length === 0 && (
        <div className="simulation-types">
          <h2 className="section-title">Available Simulation Types</h2>
          <div className="types-grid">
            <div className="type-card">
              <div className="type-icon email">
                <Mail size={32} />
              </div>
              <h3>Phishing Email</h3>
              <p>Simulate realistic phishing attacks to test email security awareness</p>
              <ul className="type-features">
                <li>Customizable email templates</li>
                <li>Real-time detection tracking</li>
                <li>Detailed reporting</li>
              </ul>
            </div>

            <div className="type-card">
              <div className="type-icon phone">
                <Phone size={32} />
              </div>
              <h3>Social Engineering Call</h3>
              <p>Test resistance to social engineering attacks via phone calls</p>
              <ul className="type-features">
                <li>Scenario-based calls</li>
                <li>Voice interaction tracking</li>
                <li>Response analysis</li>
              </ul>
            </div>

            <div className="type-card">
              <div className="type-icon website">
                <Globe size={32} />
              </div>
              <h3>Malicious Website</h3>
              <p>Simulate malicious websites to test browsing security habits</p>
              <ul className="type-features">
                <li>Fake login pages</li>
                <li>Download tracking</li>
                <li>Behavior analysis</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulations;