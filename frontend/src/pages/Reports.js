import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users, 
  Award,
  Calendar,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    personalProgress: {
      completedModules: 0,
      totalModules: 0,
      averageScore: 0,
      totalPoints: 0,
      badges: [],
      recentActivity: []
    },
    organizationStats: {
      totalUsers: 0,
      completedAssessments: 0,
      averageScore: 0,
      activeSimulations: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30');

  useEffect(() => {
    fetchReportData();
  }, [user, timeFilter]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'admin') {
        // Admin reports
        const [statsResponse, userProgressResponse] = await Promise.all([
          axios.get('/dashboard/stats'),
          axios.get('/dashboard/user-progress')
        ]);
        
        setReportData(prev => ({
          ...prev,
          organizationStats: statsResponse.data,
          userProgress: userProgressResponse.data
        }));
      } else {
        // User reports
        const [progressResponse, assessmentsResponse, modulesResponse] = await Promise.all([
          axios.get('/progress/my'),
          axios.get('/assessments/my'),
          axios.get('/modules')
        ]);
        
        const completedModules = progressResponse.data.filter(p => p.completed).length;
        const totalScore = assessmentsResponse.data.reduce((sum, a) => sum + (a.score || 0), 0);
        const avgScore = assessmentsResponse.data.length > 0 
          ? totalScore / assessmentsResponse.data.length 
          : 0;

        setReportData(prev => ({
          ...prev,
          personalProgress: {
            completedModules,
            totalModules: modulesResponse.data.length,
            averageScore: Math.round(avgScore),
            totalPoints: user.progress_points || 0,
            badges: user.badges || [],
            recentActivity: assessmentsResponse.data.slice(-10).reverse()
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    const { completedModules, totalModules } = reportData.personalProgress;
    if (totalModules === 0) return 0;
    return Math.round((completedModules / totalModules) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-pass';
    return 'score-fail';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-page" data-testid="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h1 className="page-title">
            {user?.role === 'admin' ? 'Analytics Dashboard' : 'Progress Reports'}
          </h1>
          <p className="page-subtitle">
            {user?.role === 'admin' 
              ? 'Monitor organizational cybersecurity training progress and effectiveness'
              : 'Track your cybersecurity learning journey and achievements'
            }
          </p>
        </div>

        <div className="reports-controls">
          <div className="time-filter">
            <Filter size={16} />
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="filter-select"
              data-testid="time-filter"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <button className="export-btn" data-testid="export-btn">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {user?.role === 'admin' ? (
        /* Admin Dashboard */
        <div className="admin-reports">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card users">
              <div className="metric-icon">
                <Users size={32} />
              </div>
              <div className="metric-content">
                <div className="metric-number">{reportData.organizationStats.totalUsers}</div>
                <div className="metric-label">Total Users</div>
                <div className="metric-change positive">+12% this month</div>
              </div>
            </div>

            <div className="metric-card assessments">
              <div className="metric-icon">
                <CheckCircle size={32} />
              </div>
              <div className="metric-content">
                <div className="metric-number">{reportData.organizationStats.completedAssessments}</div>
                <div className="metric-label">Completed Assessments</div>
                <div className="metric-change positive">+8% this month</div>
              </div>
            </div>

            <div className="metric-card simulations">
              <div className="metric-icon">
                <Target size={32} />
              </div>
              <div className="metric-content">
                <div className="metric-number">{reportData.organizationStats.activeSimulations}</div>
                <div className="metric-label">Active Simulations</div>
                <div className="metric-change neutral">No change</div>
              </div>
            </div>

            <div className="metric-card modules">
              <div className="metric-icon">
                <BookOpen size={32} />
              </div>
              <div className="metric-content">
                <div className="metric-number">{reportData.organizationStats.totalModules}</div>
                <div className="metric-label">Training Modules</div>
                <div className="metric-change positive">+2 new modules</div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="charts-section">
            <div className="chart-container">
              <div className="chart-header">
                <h3>Training Completion Trends</h3>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color blue"></div>
                    <span>Completed Modules</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color green"></div>
                    <span>Assessment Scores</span>
                  </div>
                </div>
              </div>
              <div className="chart-placeholder">
                <BarChart3 size={48} />
                <p>Interactive charts would be rendered here using a charting library like Chart.js or D3.js</p>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3>Security Awareness Score</h3>
                <div className="score-display">
                  <div className="score-circle">
                    <div className="score-number">87%</div>
                  </div>
                </div>
              </div>
              <div className="score-breakdown">
                <div className="breakdown-item">
                  <span>Phishing Detection</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '92%' }}></div>
                  </div>
                  <span>92%</span>
                </div>
                <div className="breakdown-item">
                  <span>Password Security</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '85%' }}></div>
                  </div>
                  <span>85%</span>
                </div>
                <div className="breakdown-item">
                  <span>Social Engineering</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '78%' }}></div>
                  </div>
                  <span>78%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="top-performers">
            <h3>Top Performers</h3>
            <div className="performers-list">
              <div className="performer-item">
                <div className="performer-rank">1</div>
                <div className="performer-info">
                  <div className="performer-name">John Smith</div>
                  <div className="performer-score">98% Average Score</div>
                </div>
                <div className="performer-badges">
                  <Award size={16} />
                  <span>12 badges</span>
                </div>
              </div>
              <div className="performer-item">
                <div className="performer-rank">2</div>
                <div className="performer-info">
                  <div className="performer-name">Sarah Johnson</div>
                  <div className="performer-score">96% Average Score</div>
                </div>
                <div className="performer-badges">
                  <Award size={16} />
                  <span>10 badges</span>
                </div>
              </div>
              <div className="performer-item">
                <div className="performer-rank">3</div>
                <div className="performer-info">
                  <div className="performer-name">Mike Davis</div>
                  <div className="performer-score">94% Average Score</div>
                </div>
                <div className="performer-badges">
                  <Award size={16} />
                  <span>9 badges</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* User Reports */
        <div className="user-reports">
          {/* Progress Overview */}
          <div className="progress-overview">
            <div className="overview-card completion">
              <div className="card-icon">
                <TrendingUp size={32} />
              </div>
              <div className="card-content">
                <div className="card-number">{getProgressPercentage()}%</div>
                <div className="card-label">Overall Progress</div>
                <div className="card-detail">
                  {reportData.personalProgress.completedModules} of {reportData.personalProgress.totalModules} modules completed
                </div>
              </div>
            </div>

            <div className="overview-card score">
              <div className="card-icon">
                <BarChart3 size={32} />
              </div>
              <div className="card-content">
                <div className={`card-number ${getScoreColor(reportData.personalProgress.averageScore)}`}>
                  {reportData.personalProgress.averageScore}%
                </div>
                <div className="card-label">Average Score</div>
                <div className="card-detail">
                  Across all completed assessments
                </div>
              </div>
            </div>

            <div className="overview-card points">
              <div className="card-icon">
                <Award size={32} />
              </div>
              <div className="card-content">
                <div className="card-number">{reportData.personalProgress.totalPoints}</div>
                <div className="card-label">Security Points</div>
                <div className="card-detail">
                  {reportData.personalProgress.badges.length} badges earned
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Progress */}
          <div className="detailed-progress">
            <div className="progress-chart">
              <h3>Learning Progress</h3>
              <div className="progress-visual">
                <div className="progress-circle-large">
                  <div className="progress-text">
                    <div className="progress-percentage">{getProgressPercentage()}%</div>
                    <div className="progress-label">Complete</div>
                  </div>
                </div>
                <div className="progress-stats">
                  <div className="stat-item">
                    <CheckCircle size={20} className="stat-icon complete" />
                    <span>{reportData.personalProgress.completedModules} Completed</span>
                  </div>
                  <div className="stat-item">
                    <Clock size={20} className="stat-icon pending" />
                    <span>{reportData.personalProgress.totalModules - reportData.personalProgress.completedModules} Remaining</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="achievements-section">
              <h3>Achievements</h3>
              {reportData.personalProgress.badges.length > 0 ? (
                <div className="badges-grid">
                  {reportData.personalProgress.badges.map((badge, index) => (
                    <div key={index} className="badge-item">
                      <Award size={24} />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-badges">
                  <Award size={48} />
                  <p>Complete more modules to earn badges!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            {reportData.personalProgress.recentActivity.length > 0 ? (
              <div className="activity-timeline">
                {reportData.personalProgress.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item" data-testid={`activity-${index}`}>
                    <div className="activity-date">
                      <Calendar size={16} />
                      <span>{formatDate(activity.completed_at || activity.created_at)}</span>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">Assessment Completed</div>
                      <div className="activity-details">
                        <span className={`activity-score ${getScoreColor(activity.score || 0)}`}>
                          Score: {activity.score || 0}%
                        </span>
                        {activity.score >= 70 ? (
                          <CheckCircle size={16} className="activity-status pass" />
                        ) : (
                          <AlertTriangle size={16} className="activity-status fail" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-activity">
                <Clock size={48} />
                <p>Start taking assessments to see your activity here!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;