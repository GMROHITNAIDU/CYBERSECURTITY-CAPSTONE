import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FileText, 
  Calendar, 
  User, 
  Eye, 
  Download,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import './Policies.css';

const Policies = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/policies');
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

 const getCategoryIcon = (category) => {
   const cat = (category || 'general').toLowerCase();
   switch (cat) {
      case 'security':
        return <Shield className="category-icon" />;
      case 'privacy':
        return <User className="category-icon" />;
      case 'compliance':
        return <CheckCircle className="category-icon" />;
      default:
        return <FileText className="category-icon" />;
    }
  };

 const getCategoryColor = (category) => {
     const cat = (category || 'general').toLowerCase();
   switch (cat) {
      case 'security':
        return 'category-security';
      case 'privacy':
        return 'category-privacy';
      case 'compliance':
        return 'category-compliance';
      default:
        return 'category-general';
    }
  };

  const filteredPolicies = policies.filter(policy => {
 const title = (policy.title || '').toLowerCase();
 const desc  = (policy.description || '').toLowerCase();
 const matchesSearch = title.includes(searchTerm.toLowerCase()) ||
                       desc.includes(searchTerm.toLowerCase());
    const matchesCategory =
   categoryFilter === 'all' ||
   (policy.category || 'General') === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(policies.map(p => p.category || 'General'))];

  if (loading) {
    return (
      <div className="policies-loading">
        <div className="loading-spinner"></div>
        <p>Loading policies...</p>
      </div>
    );
  }

  return (
    <div className="policies-page" data-testid="policies-page">
      {/* Header */}
      <div className="policies-header">
        <div className="header-content">
          <h1 className="page-title">Cybersecurity Policies</h1>
          <p className="page-subtitle">
            Access and review organizational cybersecurity policies and guidelines
          </p>
        </div>

        <div className="policies-stats">
          <div className="stat-item">
            <span className="stat-number">{policies.length}</span>
            <span className="stat-label">Total Policies</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{categories.length}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="policies-controls">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            data-testid="search-input"
          />
        </div>

        <div className="filter-container">
          <Filter size={16} className="filter-icon" />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
            data-testid="category-filter"
          >
            <option value="all">All Categories</option>
 {categories.map((category, idx) => {
  const val = category || 'General';
   return <option key={`${val}-${idx}`} value={val}>{val}</option>;
 })}
          </select>
        </div>

        {user?.role === 'admin' && (
          <button className="create-policy-btn" data-testid="create-policy-btn">
            <Plus size={16} />
            Create Policy
          </button>
        )}
      </div>

      {/* Policies Grid */}
      <div className="policies-grid">
        {filteredPolicies.length > 0 ? (
          filteredPolicies.map((policy, index) => (
            <div 
              key={policy.id} 
              className="policy-card"
              data-testid={`policy-card-${index}`}
            >
              <div className="policy-header">
                <div className={`policy-category ${getCategoryColor(policy.category)}`}>
                  {getCategoryIcon(policy.category)}
                  <span className="category-text">{policy.category || 'General'}</span>
                </div>
                
                <div className="policy-version">v{policy.version}</div>
              </div>

              <div className="policy-content">
                <h3 className="policy-title">{policy.title}</h3>
                <p className="policy-description">{policy.description}</p>

                <div className="policy-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Effective: {policy.effective_date ? formatDate(policy.effective_date) : '—'}</span>
                  </div>
                  
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>Updated: {policy.created_at ? formatDate(policy.created_at) : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="policy-actions">
                <button 
                  onClick={() => handleViewPolicy(policy)}
                  className="action-btn primary"
                  data-testid={`view-policy-${index}`}
                >
                  <Eye size={16} />
                  View Policy
                </button>
                
                <button 
                  className="action-btn secondary"
                  data-testid={`download-policy-${index}`}
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FileText size={64} />
            <h3>No policies found</h3>
            <p>
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No policies have been created yet'
              }
            </p>
            {(searchTerm || categoryFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                className="reset-filters-btn"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Policy Categories Info */}
      {policies.length > 0 && (
        <div className="policy-categories">
          <h2 className="section-title">Policy Categories</h2>
          <div className="categories-grid">
            <div className="category-info security">
              <Shield size={32} />
              <h3>Security Policies</h3>
              <p>Guidelines for maintaining organizational security standards</p>
              <span className="category-count">
                {policies.filter(p => (p.category || 'general').toLowerCase() === 'security').length} policies
              </span>
            </div>

            <div className="category-info privacy">
              <User size={32} />
              <h3>Privacy Policies</h3>
              <p>Data protection and privacy compliance requirements</p>
              <span className="category-count">
                {policies.filter(p => p.category.toLowerCase() === 'privacy').length} policies
              </span>
            </div>

            <div className="category-info compliance">
              <CheckCircle size={32} />
              <h3>Compliance Policies</h3>
              <p>Regulatory compliance and audit requirements</p>
              <span className="category-count">
                {policies.filter(p => p.category.toLowerCase() === 'compliance').length} policies
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showModal && selectedPolicy && (
        <div className="policy-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>{selectedPolicy.title}</h2>
                <span className="modal-version">Version {selectedPolicy.version}</span>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="modal-close"
                data-testid="close-modal-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="policy-info">
                <div className="info-item">
                  <strong>Category:</strong> {selectedPolicy.category}
                </div>
                <div className="info-item">
                  <strong>Effective Date:</strong> {formatDate(selectedPolicy.effective_date)}
                </div>
                <div className="info-item">
                  <strong>Description:</strong> {selectedPolicy.description}
                </div>
              </div>

              <div className="policy-text">
                <h3>Policy Content</h3>
                <div className="content-text">
                  {(selectedPolicy.content || '').split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button className="btn-primary">
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;