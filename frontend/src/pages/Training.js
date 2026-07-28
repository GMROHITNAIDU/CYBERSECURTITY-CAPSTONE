import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Play, 
  CheckCircle, 
  Lock,
  Filter,
  Search,
  Target,
  Shield,
  Users,
  FileText
} from 'lucide-react';
import './Training.css';

const Training = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const [modulesResponse, progressResponse] = await Promise.all([
        axios.get('/modules'),
        axios.get('/progress/my')
      ]);
      
      setModules(modulesResponse.data);
      setProgress(progressResponse.data);
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleProgress = (moduleId) => {
    const moduleProgress = progress.find(p => p.module_id === moduleId);
    return moduleProgress || { progress_percentage: 0, completed: false };
  };

  const getModuleTypeIcon = (type) => {
    switch (type) {
      case 'phishing':
        return <Target className="module-type-icon" />;
      case 'password_security':
        return <Shield className="module-type-icon" />;
      case 'social_engineering':
        return <Users className="module-type-icon" />;
      case 'data_privacy':
        return <FileText className="module-type-icon" />;
      default:
        return <BookOpen className="module-type-icon" />;
    }
  };

  const getDifficultyStars = (level) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        size={14} 
        className={index < level ? 'star-filled' : 'star-empty'} 
      />
    ));
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'completed') {
      const moduleProgress = getModuleProgress(module.id);
      return matchesSearch && moduleProgress.completed;
    }
    if (filter === 'in-progress') {
      const moduleProgress = getModuleProgress(module.id);
      return matchesSearch && moduleProgress.progress_percentage > 0 && !moduleProgress.completed;
    }
    if (filter === 'not-started') {
      const moduleProgress = getModuleProgress(module.id);
      return matchesSearch && moduleProgress.progress_percentage === 0;
    }
    
    return matchesSearch && module.module_type === filter;
  });

  if (loading) {
    return (
      <div className="training-loading">
        <div className="loading-spinner"></div>
        <p>Loading training modules...</p>
      </div>
    );
  }

  return (
    <div className="training-page" data-testid="training-page">
      {/* Header */}
      <div className="training-header">
        <div className="header-content">
          <h1 className="page-title">Cybersecurity Training Modules</h1>
          <p className="page-subtitle">
            Master cybersecurity fundamentals through interactive training and assessments
          </p>
        </div>
        
        <div className="training-stats">
          <div className="stat-item">
            <span className="stat-number">{modules.length}</span>
            <span className="stat-label">Total Modules</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {progress.filter(p => p.completed).length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Math.round(progress.reduce((sum, p) => sum + p.progress_percentage, 0) / Math.max(modules.length, 1))}%
            </span>
            <span className="stat-label">Average Progress</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="training-filters">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search training modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            data-testid="search-input"
          />
        </div>

        <div className="filter-container">
          <Filter size={16} className="filter-icon" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
            data-testid="filter-select"
          >
            <option value="all">All Modules</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="phishing">Phishing</option>
            <option value="password_security">Password Security</option>
            <option value="social_engineering">Social Engineering</option>
            <option value="data_privacy">Data Privacy</option>
          </select>
        </div>
      </div>

      {/* Training Modules Grid */}
      <div className="modules-grid">
        {filteredModules.length > 0 ? (
          filteredModules.map((module, index) => {
            const moduleProgress = getModuleProgress(module.id);
            const isCompleted = moduleProgress.completed;
            const progressPercentage = moduleProgress.progress_percentage;
            
            return (
              <div 
                key={module.id} 
                className={`module-card ${isCompleted ? 'completed' : ''}`}
                data-testid={`module-card-${index}`}
              >
                <div className="module-header">
                  <div className="module-type">
                    {getModuleTypeIcon(module.module_type)}
                    <span className="module-type-text">
                      {module.module_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {isCompleted && (
                    <div className="completion-badge">
                      <CheckCircle size={16} />
                      <span>Completed</span>
                    </div>
                  )}
                </div>

                <div className="module-content">
                  <h3 className="module-title">{module.title}</h3>
                  <p className="module-description">{module.description}</p>

                  <div className="module-meta">
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{module.duration_minutes} min</span>
                    </div>
                    
                    <div className="meta-item">
                      <div className="difficulty-stars">
                        {getDifficultyStars(module.difficulty_level)}
                      </div>
                      <span className="difficulty-text">
                        Level {module.difficulty_level}
                      </span>
                    </div>
                  </div>

                  {progressPercentage > 0 && (
                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="module-actions">
                  <Link 
                    to={`/training/${module.id}`}
                    className={`start-btn ${isCompleted ? 'retake' : 'start'}`}
                    data-testid={`start-module-${index}`}
                  >
                    <Play size={16} />
                    <span>
                      {isCompleted ? 'Retake Assessment' : 
                       progressPercentage > 0 ? 'Continue' : 'Start Module'}
                    </span>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No modules found</h3>
            <p>
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No training modules available at the moment'
              }
            </p>
            {(searchTerm || filter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="reset-filters-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Learning Path Suggestions */}
      {modules.length > 0 && (
        <div className="learning-path">
          <h2 className="section-title">Recommended Learning Path</h2>
          <div className="path-container">
            <div className="path-item beginner">
              <div className="path-number">1</div>
              <div className="path-content">
                <h4>Beginner</h4>
                <p>Start with phishing awareness and password security basics</p>
                <div className="path-modules">
                  {modules
                    .filter(m => m.difficulty_level <= 2)
                    .slice(0, 2)
                    .map(module => (
                      <span key={module.id} className="path-module">
                        {module.title}
                      </span>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="path-item intermediate">
              <div className="path-number">2</div>
              <div className="path-content">
                <h4>Intermediate</h4>
                <p>Advance to social engineering and data privacy</p>
                <div className="path-modules">
                  {modules
                    .filter(m => m.difficulty_level >= 3 && m.difficulty_level <= 4)
                    .slice(0, 2)
                    .map(module => (
                      <span key={module.id} className="path-module">
                        {module.title}
                      </span>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="path-item advanced">
              <div className="path-number">3</div>
              <div className="path-content">
                <h4>Advanced</h4>
                <p>Master complex security scenarios and incident response</p>
                <div className="path-modules">
                  {modules
                    .filter(m => m.difficulty_level === 5)
                    .slice(0, 2)
                    .map(module => (
                      <span key={module.id} className="path-module">
                        {module.title}
                      </span>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;