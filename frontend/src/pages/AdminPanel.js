import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, 
  BookOpen, 
  Target, 
  FileText, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Play,
  Square,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalModules: 0,
    completedAssessments: 0,
    activeSimulations: 0
  });

  // Data
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // User modals
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Module modals
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);

  // Policy modals
  const [showCreatePolicyModal, setShowCreatePolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  // Simulation modals
  const [showCreateSimulationModal, setShowCreateSimulationModal] = useState(false);
  const [editingSimulation, setEditingSimulation] = useState(null);

  // Forms
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'learner' });

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    module_type: 'phishing',
    content: { sections: [] },
    duration_minutes: 15,
    difficulty_level: 1,
    policy_references: []
  });

  const [newPolicy, setNewPolicy] = useState({
    title: '',
    description: '',
    content: '',
    category: 'security',
    version: '1.0',
    effective_date: new Date().toISOString().split('T')[0],
    requires_acknowledgment: true,
    is_mandatory: true
  });

  // NEW: simulation form (create)
  const [newSimulation, setNewSimulation] = useState({
    title: '',
    scenario_type: 'phishing_email',
    description: '',
    scheduled_at: '',
    target_users_csv: '', // comma-separated emails/user IDs -> converted to array
  });

  // Util
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => role === 'admin' ? 'role-admin' : 'role-learner';
  const getStatusColor = (isActive) => isActive ? 'status-active' : 'status-inactive';

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          userItem.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || userItem.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Data load
  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [statsResponse, modulesResponse, simulationsResponse] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/modules'),
        axios.get('/simulations')
      ]);

      setStats(statsResponse.data);
      setModules(modulesResponse.data);
      setSimulations(simulationsResponse.data);

      if (activeTab === 'users' || activeTab === 'overview') {
        const usersResponse = await axios.get('/admin/users');
        setUsers(usersResponse.data);
      }

      if (activeTab === 'policies') {
        const policiesResponse = await axios.get('/policies');
        setPolicies(policiesResponse.data);
      }

      if (activeTab === 'overview') {
        const analyticsResponse = await axios.get('/admin/analytics/overview');
        setAnalytics(analyticsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Users CRUD
  // -------------------------
  const handleCreateUser = async () => {
    try {
      await axios.post('/admin/users', newUser);
      toast.success('User created successfully');
      setShowCreateUserModal(false);
      setNewUser({ full_name: '', email: '', password: '', role: 'learner' });
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId, updateData) => {
    try {
      await axios.put(`/admin/users/${userId}`, updateData);
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchAdminData();
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to delete user');
      }
    }
  };

  // -------------------------
  // Modules CRUD
  // -------------------------
  const handleCreateModule = async () => {
    try {
      await axios.post('/modules', newModule);
      toast.success('Module created successfully');
      setShowCreateModuleModal(false);
      setNewModule({
        title: '',
        description: '',
        module_type: 'phishing',
        content: { sections: [] },
        duration_minutes: 15,
        difficulty_level: 1,
        policy_references: []
      });
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create module');
    }
  };

  const handleToggleModule = async (moduleId) => {
    try {
      await axios.post(`/admin/modules/${moduleId}/toggle`);
      toast.success('Module status updated');
      fetchAdminData();
    } catch {
      toast.error('Failed to update module status');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to deactivate this module?')) {
      try {
        await axios.delete(`/admin/modules/${moduleId}`);
        toast.success('Module deactivated successfully');
        fetchAdminData();
      } catch {
        toast.error('Failed to deactivate module');
      }
    }
  };

  // -------------------------
  // Policies CRUD
  // -------------------------
  const handleCreatePolicy = async () => {
    try {
      await axios.post('/admin/policies', newPolicy);
      toast.success('Policy created successfully');
      setShowCreatePolicyModal(false);
      setNewPolicy({
        title: '',
        description: '',
        content: '',
        category: 'security',
        version: '1.0',
        effective_date: new Date().toISOString().split('T')[0],
        requires_acknowledgment: true,
        is_mandatory: true
      });
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Failed to create policy');
    }
  };

  const handleUpdatePolicy = async (policyId, updateData) => {
    try {
      await axios.put(`/admin/policies/${policyId}`, updateData);
      toast.success('Policy updated successfully');
      setEditingPolicy(null);
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Failed to update policy');
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await axios.delete(`/admin/policies/${policyId}`);
        toast.success('Policy deleted successfully');
        fetchAdminData();
      } catch (error) {
        toast.error(error.response?.data?.error || error.response?.data?.detail || 'Failed to delete policy');
      }
    }
  };

  const handleTogglePolicy = async (policyId) => {
    try {
      await axios.post(`/admin/policies/${policyId}/toggle`);
      toast.success('Policy status updated');
      fetchAdminData();
    } catch {
      toast.error('Failed to update policy status');
    }
  };

  // -------------------------
  // Simulations CRUD
  // -------------------------
  const toArray = (csv) =>
    csv
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

  const handleOpenCreateSimulation = () => {
    setNewSimulation({
      title: '',
      scenario_type: 'phishing_email',
      description: '',
      scheduled_at: '',
      target_users_csv: '',
    });
    setShowCreateSimulationModal(true);
  };

  const handleCreateSimulation = async () => {
    try {
      const payload = {
        title: newSimulation.title,
        scenario_type: newSimulation.scenario_type,
        description: newSimulation.description,
        scheduled_at: newSimulation.scheduled_at || null,
        target_users: toArray(newSimulation.target_users_csv),
        status: 'scheduled',
      };
      await axios.post('/simulations', payload); // adminOnly on backend
      toast.success('Simulation created');
      setShowCreateSimulationModal(false);
      fetchAdminData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to create simulation');
    }
  };

  const handleEditSimulation = (sim) => {
    setEditingSimulation({
      ...sim,
      // local CSV field for editing
      target_users_csv: Array.isArray(sim.target_users) ? sim.target_users.join(', ') : ''
    });
  };

  const handleUpdateSimulation = async () => {
    if (!editingSimulation) return;
    try {
      const payload = {
        title: editingSimulation.title,
        scenario_type: editingSimulation.scenario_type,
        description: editingSimulation.description,
        scheduled_at: editingSimulation.scheduled_at || null,
        target_users: toArray(editingSimulation.target_users_csv),
        status: editingSimulation.status,
      };
      await axios.put(`/admin/simulations/${editingSimulation.id}`, payload);
      toast.success('Simulation updated');
      setEditingSimulation(null);
      fetchAdminData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to update simulation');
    }
  };

  const handleDeleteSimulation = async (id) => {
    if (!id) return;
    if (window.confirm('Delete this simulation? This cannot be undone.')) {
      try {
        await axios.delete(`/admin/simulations/${id}`);
        toast.success('Simulation deleted');
        fetchAdminData();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.error || 'Failed to delete simulation');
      }
    }
  };

  const handleStartSimulation = async (simulationId) => {
    try {
      await axios.post(`/admin/simulations/${simulationId}/start`);
      toast.success('Simulation started');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start simulation');
    }
  };

  const handleStopSimulation = async (simulationId) => {
    try {
      await axios.post(`/admin/simulations/${simulationId}/stop`);
      toast.success('Simulation stopped');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to stop simulation');
    }
  };

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'modules', label: 'Training Modules', icon: BookOpen },
    { id: 'simulations', label: 'Simulations', icon: Target },
    { id: 'policies', label: 'Policy Management', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel" data-testid="admin-panel">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1 className="page-title">Administration Panel</h1>
          <p className="page-subtitle">
            Manage users, training content, and system settings
          </p>
        </div>
        <div className="admin-badge">
          <Shield size={16} />
          <span>Administrator</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              data-testid={`tab-${tab.id}`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-stats">
              <div className="stat-card users">
                <div className="stat-icon">
                  <Users size={32} />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                  <div className="stat-change">+3 this week</div>
                </div>
              </div>

              <div className="stat-card modules">
                <div className="stat-icon">
                  <BookOpen size={32} />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{stats.totalModules}</div>
                  <div className="stat-label">Training Modules</div>
                  <div className="stat-change">2 active</div>
                </div>
              </div>

              <div className="stat-card assessments">
                <div className="stat-icon">
                  <CheckCircle size={32} />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{stats.completedAssessments}</div>
                  <div className="stat-label">Completed Assessments</div>
                  <div className="stat-change">+8 today</div>
                </div>
              </div>

              <div className="stat-card simulations">
                <div className="stat-icon">
                  <Target size={32} />
                </div>
                <div className="stat-info">
                  <div className="stat-number">{stats.activeSimulations}</div>
                  <div className="stat-label">Active Simulations</div>
                  <div className="stat-change">Running</div>
                </div>
              </div>
            </div>

            <div className="overview-sections">
              <div className="section recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <CheckCircle size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">John Smith completed Phishing Awareness module</div>
                      <div className="activity-time">2 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <Users size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">New user Sarah Johnson registered</div>
                      <div className="activity-time">4 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <Target size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">Phishing simulation started for 5 users</div>
                      <div className="activity-time">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section system-health">
                <h3>System Health</h3>
                <div className="health-metrics">
                  <div className="health-item">
                    <div className="health-status good">
                      <CheckCircle size={16} />
                    </div>
                    <span>Database Connection</span>
                  </div>
                  <div className="health-item">
                    <div className="health-status good">
                      <CheckCircle size={16} />
                    </div>
                    <span>API Services</span>
                  </div>
                  <div className="health-item">
                    <div className="health-status warning">
                      <AlertCircle size={16} />
                    </div>
                    <span>Email Service</span>
                  </div>
                  <div className="health-item">
                    <div className="health-status good">
                      <CheckCircle size={16} />
                    </div>
                    <span>File Storage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="users-content">
            <div className="users-header">
              <h3>User Management</h3>
              <button 
                className="create-btn" 
                onClick={() => setShowCreateUserModal(true)}
                data-testid="create-user-btn"
              >
                <Plus size={16} />
                Add User
              </button>
            </div>

            <div className="users-controls">
              <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  data-testid="users-search"
                />
              </div>

              <div className="filter-container">
                <Filter size={16} className="filter-icon" />
                <select 
                  value={filterRole} 
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="filter-select"
                  data-testid="role-filter"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="learner">Learners</option>
                </select>
              </div>
            </div>

            <div className="users-table">
              <div className="table-header">
                <div className="table-cell">User</div>
                <div className="table-cell">Role</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Last Login</div>
                <div className="table-cell">Points</div>
                <div className="table-cell">Actions</div>
              </div>

              <div className="table-body">
                {filteredUsers.map((userItem, index) => (
                  <div key={userItem.id} className="table-row" data-testid={`user-row-${index}`}>
                    <div className="table-cell user-info">
                      <div className="user-details">
                        <div className="user-name">{userItem.full_name}</div>
                        <div className="user-email">{userItem.email}</div>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className={`role-badge ${getRoleColor(userItem.role)}`}>
                        {userItem.role}
                      </span>
                    </div>
                    <div className="table-cell">
                      <span className={`status-badge ${getStatusColor(userItem.is_active)}`}>
                        {userItem.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <div className="date-info">
                        <Clock size={14} />
                        <span>{userItem.last_login ? formatDate(userItem.last_login) : 'Never'}</span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="points-badge">{userItem.progress_points || 0}</span>
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        <button className="action-btn view" title="View User">
                          <Eye size={14} />
                        </button>
                        <button 
                          className="action-btn edit" 
                          onClick={() => setEditingUser(userItem)}
                          title="Edit User"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDeleteUser(userItem.id)}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Training Modules Tab */}
        {activeTab === 'modules' && (
          <div className="modules-content">
            <div className="modules-header">
              <h3>Training Modules</h3>
              <button 
                className="create-btn"
                onClick={() => setShowCreateModuleModal(true)}
                data-testid="create-module-btn"
              >
                <Plus size={16} />
                Create Module
              </button>
            </div>

            <div className="modules-grid">
              {modules.map((module, index) => (
                <div key={module.id} className="module-card admin" data-testid={`admin-module-${index}`}>
                  <div className="module-header">
                    <div className="module-type">
                      {module.module_type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="module-actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => setEditingModule(module)}
                        title="Edit Module"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="action-btn toggle"
                        onClick={() => handleToggleModule(module.id)}
                        title={module.is_active ? "Deactivate" : "Activate"}
                      >
                        {module.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteModule(module.id)}
                        title="Deactivate Module"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="module-content">
                    <h4 className="module-title">{module.title}</h4>
                    <p className="module-description">{module.description}</p>

                    <div className="module-stats">
                      <div className="stat-item">
                        <Clock size={14} />
                        <span>{module.duration_minutes} min</span>
                      </div>
                      <div className="stat-item">
                        <Target size={14} />
                        <span>Level {module.difficulty_level}</span>
                      </div>
                      <div className="stat-item">
                        <CheckCircle size={14} />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="module-footer">
                    <span className={`status-badge ${module.is_active ? 'status-active' : 'status-inactive'}`}>
                      {module.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="view-btn">
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulations Tab */}
        {activeTab === 'simulations' && (
          <div className="simulations-content">
            <div className="simulations-header">
              <h3>Simulation Management</h3>
              <button className="create-btn" onClick={handleOpenCreateSimulation}>
                <Plus size={16} />
                Create Simulation
              </button>
            </div>

            <div className="simulations-grid">
              {simulations.map((simulation) => (
                <div key={simulation.id} className="simulation-card admin">
                  <div className="simulation-header">
                    <div className="simulation-type">
                      {simulation.scenario_type?.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="simulation-status">
                      <span className={`status-badge status-${simulation.status}`}>
                        {simulation.status}
                      </span>
                    </div>
                  </div>

                  <div className="simulation-content">
                    <h4>{simulation.title}</h4>
                    <p className="simulation-description">{simulation.description}</p>
                    
                    <div className="simulation-meta">
                      <div className="meta-item">
                        <Users size={14} />
                        <span>{simulation.target_users?.length || 0} users</span>
                      </div>
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>{formatDate(simulation.scheduled_at)}</span>
                      </div>
                    </div>

                    {Array.isArray(simulation.target_users) && simulation.target_users.length > 0 && (
                      <div className="chip-row">
                        {simulation.target_users.slice(0, 6).map((u, i) => (
                          <span key={i} className="chip">{u}</span>
                        ))}
                        {simulation.target_users.length > 6 && (
                          <span className="chip chip-more">+{simulation.target_users.length - 6}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="simulation-actions">
                    {simulation.status === 'scheduled' && (
                      <button 
                        className="action-btn start"
                        onClick={() => handleStartSimulation(simulation.id)}
                        title="Start"
                      >
                        <Play size={14} />
                      </button>
                    )}
                    {simulation.status === 'active' && (
                      <button 
                        className="action-btn stop"
                        onClick={() => handleStopSimulation(simulation.id)}
                        title="Stop"
                      >
                        <Square size={14} />
                      </button>
                    )}
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEditSimulation(simulation)}
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteSimulation(simulation.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {simulations.length === 0 && (
                <div className="empty-state">
                  <Target size={64} />
                  <h3>No simulations found</h3>
                  <p>Create your first security simulation to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Policy Management Tab */}
        {activeTab === 'policies' && (
          <div className="policies-content">
            <div className="policies-header">
              <h3>Policy Management</h3>
              <button 
                className="create-btn" 
                onClick={() => setShowCreatePolicyModal(true)}
              >
                <Plus size={16} />
                Create Policy
              </button>
            </div>

            <div className="policies-controls">
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                <option value="security">Security</option>
                <option value="privacy">Privacy</option>
                <option value="compliance">Compliance</option>
                <option value="training">Training</option>
              </select>
            </div>

            <div className="policies-grid">
              {policies.map((policy) => (
                <div key={policy.id} className="policy-card">
                  <div className="policy-header">
                    <div className="policy-info">
                      <h4>{policy.title}</h4>
                      <div className="policy-meta">
                        <span className={`policy-category ${policy.category}`}>
                          {policy.category}
                        </span>
                        <span className="policy-version">v{policy.version}</span>
                      </div>
                    </div>
                    <div className="policy-status">
                      <span className={`status-badge ${policy.is_active ? 'status-active' : 'status-inactive'}`}>
                        {policy.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="policy-description">
                    {policy.description}
                  </div>
                  
                  <div className="policy-details">
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Effective: {formatDate(policy.effective_date)}</span>
                    </div>
                    <div className="detail-item">
                      <CheckCircle size={14} />
                      <span>{policy.requires_acknowledgment ? 'Requires Acknowledgment' : 'No Acknowledgment'}</span>
                    </div>
                  </div>
                  
                  <div className="policy-actions">
                    <button className="action-btn view" title="View Policy">
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-btn edit"
                      onClick={() => setEditingPolicy(policy)}
                      title="Edit Policy"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn toggle"
                      onClick={() => handleTogglePolicy(policy.id)}
                      title={policy.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {policy.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeletePolicy(policy.id)}
                      title="Delete Policy"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-content">
            <div className="settings-header">
              <h3>System Settings</h3>
              <p>Configure system preferences and security settings</p>
            </div>

            <div className="settings-sections">
              <div className="settings-section">
                <h4>Security Settings</h4>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Session Timeout (minutes)</label>
                    <span>Automatically log out inactive users</span>
                  </div>
                  <input type="number" defaultValue="30" className="setting-input" />
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Password Complexity</label>
                    <span>Require strong passwords</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Two-Factor Authentication</label>
                    <span>Require 2FA for admin accounts</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h4>Notification Settings</h4>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Email Notifications</label>
                    <span>Send system notifications via email</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Training Reminders</label>
                    <span>Send reminders for incomplete training</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h4>System Maintenance</h4>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Automatic Backups</label>
                    <span>Enable daily system backups</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Maintenance Window</label>
                    <span>Scheduled maintenance time</span>
                  </div>
                  <input type="time" defaultValue="02:00" className="setting-input" />
                </div>
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn-primary">
                <Save size={16} />
                Save Settings
              </button>
              <button className="btn-secondary">
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="modal-overlay" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button onClick={() => setShowCreateUserModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="learner">Learner</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateUserModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateUser} className="btn-primary">
                <Save size={16} />
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Module Modal */}
      {showCreateModuleModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModuleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Training Module</h3>
              <button onClick={() => setShowCreateModuleModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newModule.title}
                  onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                  placeholder="Enter module title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                  placeholder="Enter module description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Module Type</label>
                  <select
                    value={newModule.module_type}
                    onChange={(e) => setNewModule({...newModule, module_type: e.target.value})}
                  >
                    <option value="phishing">Phishing</option>
                    <option value="password_security">Password Security</option>
                    <option value="social_engineering">Social Engineering</option>
                    <option value="data_privacy">Data Privacy</option>
                    <option value="incident_response">Incident Response</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={newModule.duration_minutes}
                    onChange={(e) => setNewModule({...newModule, duration_minutes: parseInt(e.target.value, 10) || 0})}
                    min="1"
                    max="120"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Difficulty Level (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newModule.difficulty_level}
                  onChange={(e) => setNewModule({...newModule, difficulty_level: parseInt(e.target.value, 10) || 1})}
                />
                <span>Level {newModule.difficulty_level}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModuleModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateModule} className="btn-primary">
                <Save size={16} />
                Create Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Simulation Modal */}
      {showCreateSimulationModal && (
        <div className="modal-overlay" onClick={() => setShowCreateSimulationModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Simulation</h3>
              <button onClick={() => setShowCreateSimulationModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newSimulation.title}
                  onChange={(e) => setNewSimulation({...newSimulation, title: e.target.value})}
                  placeholder="Enter simulation title"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Scenario Type</label>
                  <select
                    value={newSimulation.scenario_type}
                    onChange={(e) => setNewSimulation({...newSimulation, scenario_type: e.target.value})}
                  >
                    <option value="phishing_email">Phishing Email</option>
                    <option value="smishing_sms">Smishing SMS</option>
                    <option value="vishing_call">Vishing Call</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Scheduled At (ISO or local)</label>
                  <input
                    type="datetime-local"
                    value={newSimulation.scheduled_at}
                    onChange={(e) => setNewSimulation({...newSimulation, scheduled_at: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={newSimulation.description}
                  onChange={(e) => setNewSimulation({...newSimulation, description: e.target.value})}
                  placeholder="Short description of the simulation"
                />
              </div>
              <div className="form-group">
                <label>Target Users (comma-separated)</label>
                <input
                  type="text"
                  value={newSimulation.target_users_csv}
                  onChange={(e) => setNewSimulation({...newSimulation, target_users_csv: e.target.value})}
                  placeholder="e.g. alice@acme.com, bob@acme.com"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateSimulationModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateSimulation} className="btn-primary">
                <Save size={16} />
                Create Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Simulation Modal */}
      {editingSimulation && (
        <div className="modal-overlay" onClick={() => setEditingSimulation(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Simulation</h3>
              <button onClick={() => setEditingSimulation(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingSimulation.title}
                  onChange={(e) => setEditingSimulation({...editingSimulation, title: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Scenario Type</label>
                  <select
                    value={editingSimulation.scenario_type}
                    onChange={(e) => setEditingSimulation({...editingSimulation, scenario_type: e.target.value})}
                  >
                    <option value="phishing_email">Phishing Email</option>
                    <option value="smishing_sms">Smishing SMS</option>
                    <option value="vishing_call">Vishing Call</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Scheduled At</label>
                  <input
                    type="datetime-local"
                    value={editingSimulation.scheduled_at ? editingSimulation.scheduled_at.toString().slice(0,16) : ''}
                    onChange={(e) => setEditingSimulation({...editingSimulation, scheduled_at: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editingSimulation.description || ''}
                  onChange={(e) => setEditingSimulation({...editingSimulation, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingSimulation.status}
                  onChange={(e) => setEditingSimulation({...editingSimulation, status: e.target.value})}
                >
                  <option value="scheduled">scheduled</option>
                  <option value="active">active</option>
                  <option value="stopped">stopped</option>
                  <option value="completed">completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Users (comma-separated)</label>
                <input
                  type="text"
                  value={editingSimulation.target_users_csv}
                  onChange={(e) => setEditingSimulation({...editingSimulation, target_users_csv: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setEditingSimulation(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateSimulation} className="btn-primary">
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option value="learner">Learner</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!editingUser.is_active}
                    onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked})}
                  />
                  Active User
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setEditingUser(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleUpdateUser(editingUser.id, {
                  full_name: editingUser.full_name,
                  email: editingUser.email,
                  role: editingUser.role,
                  is_active: !!editingUser.is_active
                })}
                className="btn-primary"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Policy Modal */}
      {showCreatePolicyModal && (
        <div className="modal-overlay" onClick={() => setShowCreatePolicyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Policy</h3>
              <button onClick={() => setShowCreatePolicyModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Policy Title</label>
                <input
                  type="text"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy({...newPolicy, title: e.target.value})}
                  placeholder="Enter policy title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})}
                  placeholder="Enter policy description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newPolicy.category}
                    onChange={(e) => setNewPolicy({...newPolicy, category: e.target.value})}
                  >
                    <option value="security">Security</option>
                    <option value="privacy">Privacy</option>
                    <option value="compliance">Compliance</option>
                    <option value="training">Training</option>
                    <option value="hr">Human Resources</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Version</label>
                  <input
                    type="text"
                    value={newPolicy.version}
                    onChange={(e) => setNewPolicy({...newPolicy, version: e.target.value})}
                    placeholder="1.0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Effective Date</label>
                <input
                  type="date"
                  value={newPolicy.effective_date}
                  onChange={(e) => setNewPolicy({...newPolicy, effective_date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Policy Content</label>
                <textarea
                  value={newPolicy.content}
                  onChange={(e) => setNewPolicy({...newPolicy, content: e.target.value})}
                  placeholder="Enter the complete policy content..."
                  rows="8"
                />
              </div>
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newPolicy.requires_acknowledgment}
                      onChange={(e) => setNewPolicy({...newPolicy, requires_acknowledgment: e.target.checked})}
                    />
                    Requires User Acknowledgment
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newPolicy.is_mandatory}
                      onChange={(e) => setNewPolicy({...newPolicy, is_mandatory: e.target.checked})}
                    />
                    Mandatory Policy
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreatePolicyModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreatePolicy} className="btn-primary">
                <Save size={16} />
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {editingPolicy && (
        <div className="modal-overlay" onClick={() => setEditingPolicy(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Policy</h3>
              <button onClick={() => setEditingPolicy(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Policy Title</label>
                <input
                  type="text"
                  value={editingPolicy.title}
                  onChange={(e) => setEditingPolicy({...editingPolicy, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingPolicy.description}
                  onChange={(e) => setEditingPolicy({...editingPolicy, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingPolicy.category}
                    onChange={(e) => setEditingPolicy({...editingPolicy, category: e.target.value})}
                  >
                    <option value="security">Security</option>
                    <option value="privacy">Privacy</option>
                    <option value="compliance">Compliance</option>
                    <option value="training">Training</option>
                    <option value="hr">Human Resources</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Version</label>
                  <input
                    type="text"
                    value={editingPolicy.version}
                    onChange={(e) => setEditingPolicy({...editingPolicy, version: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Policy Content</label>
                <textarea
                  value={editingPolicy.content}
                  onChange={(e) => setEditingPolicy({...editingPolicy, content: e.target.value})}
                  rows="8"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setEditingPolicy(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleUpdatePolicy(editingPolicy.id, {
                  title: editingPolicy.title,
                  description: editingPolicy.description,
                  content: editingPolicy.content,
                  category: editingPolicy.category,
                  version: editingPolicy.version,
                  requires_acknowledgment: editingPolicy.requires_acknowledgment,
                  is_mandatory: editingPolicy.is_mandatory
                })}
                className="btn-primary"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
