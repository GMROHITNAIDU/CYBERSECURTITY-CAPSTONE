import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Shield,
  Calendar,
  BarChart3,
  Activity,
  Award
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    modulesCompleted: 0,
    totalModules: 0,
    avgScore: 0,
    progressPoints: 0,
    recentAssessments: [],
    upcomingSimulations: []
  });
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalModules: 0,
    completedAssessments: 0,
    activeSimulations: 0
  });
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'admin') {
        const [statsResponse, modulesResponse] = await Promise.all([
          axios.get('/dashboard/stats'),
          axios.get('/modules')
        ]);
        
        setAdminStats(statsResponse.data);
        setModules(modulesResponse.data);
      } else {
        const [modulesResponse, progressResponse, assessmentsResponse] = await Promise.all([
          axios.get('/modules'),
          axios.get('/progress/my'),
          axios.get('/assessments/my')
        ]);
        
        setModules(modulesResponse.data);
        setProgress(progressResponse.data);
        
        // Calculate user stats
        const completedModules = progressResponse.data.filter(p => p.completed).length;
        const totalScore = assessmentsResponse.data.reduce((sum, a) => sum + (a.score || 0), 0);
        const avgScore = assessmentsResponse.data.length > 0 
          ? totalScore / assessmentsResponse.data.length 
          : 0;
        
        setStats({
          modulesCompleted: completedModules,
          totalModules: modulesResponse.data.length,
          avgScore: Math.round(avgScore),
          progressPoints: user.progress_points || 0,
          recentAssessments: assessmentsResponse.data.slice(-5).reverse()
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    if (stats.totalModules === 0) return 0;
    return Math.round((stats.modulesCompleted / stats.totalModules) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page" data-testid="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="dashboard-subtitle">
            {user?.role === 'admin' 
              ? 'Manage your organization\'s cybersecurity training' 
              : 'Continue your cybersecurity learning journey'
            }
          </p>
        </div>
        <div className="dashboard-role-badge">
          <Shield size={16} />
          <span className="role-text">{user?.role}</span>
        </div>
      </div>

      {/* Admin Dashboard */}
      {user?.role === 'admin' ? (
        <div className="admin-dashboard">
          <div className="stats-grid-admin">
            <div className="stat-card">
              <div className="stat-icon users">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{adminStats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon modules">
                <BookOpen size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{adminStats.totalModules}</div>
                <div className="stat-label">Training Modules</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon assessments">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{adminStats.completedAssessments}</div>
                <div className="stat-label">Completed Assessments</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon simulations">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{adminStats.activeSimulations}</div>
                <div className="stat-label">Active Simulations</div>
              </div>
            </div>
          </div>

          <div className="admin-actions">
            <Link to="/admin" className="action-card" data-testid="admin-panel-link">
              <BarChart3 size={32} />
              <div className="action-content">
                <h3>Admin Panel</h3>
                <p>Manage users, modules, and view detailed analytics</p>
              </div>
            </Link>
            
            <Link to="/training" className="action-card" data-testid="manage-modules-link">
              <BookOpen size={32} />
              <div className="action-content">
                <h3>Manage Training</h3>
                <p>Create and edit training modules and assessments</p>
              </div>
            </Link>
            
            <Link to="/simulations" className="action-card" data-testid="manage-simulations-link">
              <Target size={32} />
              <div className="action-content">
                <h3>Simulations</h3>
                <p>Create and manage phishing and security simulations</p>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        /* Learner Dashboard */
        <div className="learner-dashboard">
          {/* Stats Overview */}
          <div className="stats-grid">
            <div className="stat-card progress">
              <div className="stat-header">
                <TrendingUp size={20} />
                <span>Learning Progress</span>
              </div>
              <div className="progress-content">
                <div className="progress-circle">
                  <div className="progress-number">{getCompletionPercentage()}%</div>
                </div>
                <div className="progress-details">
                  <div>{stats.modulesCompleted} of {stats.totalModules} modules</div>
                  <div className="progress-text">completed</div>
                </div>
              </div>
            </div>

            <div className="stat-card score">
              <div className="stat-header">
                <Trophy size={20} />
                <span>Average Score</span>
              </div>
              <div className="score-content">
                <div className={`score-number ${getScoreColor(stats.avgScore)}`}>
                  {stats.avgScore}%
                </div>
                <div className="score-text">Keep improving!</div>
              </div>
            </div>

            <div className="stat-card points">
              <div className="stat-header">
                <Shield size={20} />
                <span>Security Points</span>
              </div>
              <div className="points-content">
                <div className="points-number">{stats.progressPoints}</div>
                <div className="points-text">Total earned</div>
              </div>
            </div>

            <div className="stat-card badges">
              <div className="stat-header">
                <Award size={20} />
                <span>Achievements</span>
              </div>
              <div className="badges-content">
                <div className="badges-number">{user?.badges?.length || 0}</div>
                <div className="badges-text">Badges earned</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2 className="section-title">Continue Learning</h2>
            <div className="actions-grid">
              <Link to="/training" className="action-btn primary" data-testid="start-training-btn">
                <BookOpen size={20} />
                <span>Start Training</span>
              </Link>
              
              <Link to="/simulations" className="action-btn secondary" data-testid="view-simulations-btn">
                <Target size={20} />
                <span>Practice Simulations</span>
              </Link>
              
              <Link to="/policies" className="action-btn tertiary" data-testid="review-policies-btn">
                <Shield size={20} />
                <span>Review Policies</span>
              </Link>
              
              <Link to="/reports" className="action-btn quaternary" data-testid="view-progress-btn">
                <BarChart3 size={20} />
                <span>View Progress</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h2 className="section-title">Recent Activity</h2>
            {stats.recentAssessments.length > 0 ? (
              <div className="activity-list">
                {stats.recentAssessments.map((assessment, index) => (
                  <div key={index} className="activity-item" data-testid={`activity-${index}`}>
                    <div className="activity-icon">
                      <CheckCircle size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Assessment Completed</div>
                      <div className="activity-details">
                        Score: <span className={getScoreColor(assessment.score || 0)}>
                          {assessment.score || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="activity-time">
                      {assessment.completed_at ? 
                        new Date(assessment.completed_at).toLocaleDateString() : 
                        'Recently'
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Activity size={48} />
                <p>No recent activity. Start your first training module!</p>
                <Link to="/training" className="btn-primary">
                  Browse Training Modules
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;