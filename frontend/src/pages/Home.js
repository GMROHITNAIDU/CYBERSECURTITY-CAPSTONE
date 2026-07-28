import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, Award, Users, BookOpen, BarChart } from 'lucide-react';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Interactive Training',
      description: 'Learn cybersecurity best practices through engaging, hands-on modules covering phishing, social engineering, and more.'
    },
    {
      icon: Target,
      title: 'Realistic Simulations',
      description: 'Practice with real-world cyber attack scenarios in a safe environment to build practical defense skills.'
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed progress reports, badges, and achievement systems.'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Administrators can manage organization-wide training programs and track team performance.'
    },
    {
      icon: BookOpen,
      title: 'Policy Integration',
      description: 'Access and learn organizational cybersecurity policies integrated directly into training modules.'
    },
    {
      icon: BarChart,
      title: 'Analytics & Insights',
      description: 'Get comprehensive analytics on training effectiveness and organizational security posture.'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title" data-testid="hero-title">
              Your Cybersecurity
              <span className="gradient-text"> Awareness Hub</span>
            </h1>
            <p className="hero-description">
              Transform your organization's security posture with interactive training, 
              realistic simulations, and comprehensive policy integration. Build a 
              human firewall that adapts to evolving cyber threats.
            </p>
            <div className="hero-actions">
              <Link 
                to="/register" 
                className="btn-primary hero-btn"
                data-testid="get-started-btn"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="btn-secondary hero-btn"
                data-testid="sign-in-btn"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="cyber-shield">
              <Shield size={120} />
            </div>
            <div className="floating-elements">
              <div className="float-element element-1">
                <Target size={24} />
              </div>
              <div className="float-element element-2">
                <Award size={20} />
              </div>
              <div className="float-element element-3">
                <BookOpen size={22} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comprehensive Cybersecurity Training</h2>
            <p className="section-description">
              Everything your organization needs to build a strong security culture
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="feature-card hover-lift"
                  data-testid={`feature-${index}`}
                >
                  <div className="feature-icon">
                    <Icon size={28} />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Threat Detection Improvement</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Interactive Training Modules</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Continuous Monitoring</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">ISO 27001</div>
              <div className="stat-label">Compliance Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Strengthen Your Security?</h2>
            <p className="cta-description">
              Join thousands of organizations that trust our platform to keep their teams secure.
            </p>
            <Link 
              to="/register" 
              className="btn-primary cta-btn"
              data-testid="start-training-btn"
            >
              Start Your Training Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Shield size={32} />
              <span className="footer-title">CyberLearn Hub</span>
            </div>
            <div className="footer-links">
              <Link to="/login">Sign In</Link>
              <Link to="/register">Get Started</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 CyberLearn Hub. Building stronger cybersecurity awareness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;