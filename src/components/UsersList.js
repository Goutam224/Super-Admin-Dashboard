import React, { useState, useEffect } from 'react';
import { userAPI, roleAPI } from '../services/api';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    roleIds: []
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers(filters);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleAPI.getRoles();
      setRoles(response.data.roles);
    } catch (err) {
      console.error('Failed to fetch roles');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.createUser(createForm);
      setShowCreateForm(false);
      setCreateForm({ name: '', email: '', password: '', roleIds: [] });
      fetchUsers();
      alert('User created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(id);
        fetchUsers();
        alert('User deleted successfully!');
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await roleAPI.assignRole({ userId, roleId });
      fetchUsers();
      alert('Role assigned successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign role');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2>👥 Users Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ➕ Create User
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr auto',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          placeholder="🔍 Search users by name or email..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        />
        <select
          value={filters.role}
          onChange={(e) => setFilters({...filters, role: e.target.value, page: 1})}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role.id} value={role.name}>{role.name}</option>
          ))}
        </select>
        <button
          onClick={fetchUsers}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Loading users...</div>
      ) : (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  👤 Name
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  ✉️ Email
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  🏷️ Roles
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  🕒 Last Login
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  ⚙️ Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}>{user.name}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    {user.roles.map(role => (
                      <span
                        key={role.id}
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          margin: '0.125rem',
                          backgroundColor: role.name === 'superadmin' ? '#dbeafe' : 
                                          role.name === 'admin' ? '#fef3c7' : '#d1fae5',
                          color: role.name === 'superadmin' ? '#1e40af' : 
                                role.name === 'admin' ? '#92400e' : '#065f46',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}
                      >
                        {role.name}
                      </span>
                    ))}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nRoles: ${user.roles.map(r => r.name).join(', ')}\nCreated: ${new Date(user.createdAt).toLocaleDateString()}`)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        margin: '0.125rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      👁️ View
                    </button>
                    
                    {/* Quick Role Assignment */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignRole(user.id, parseInt(e.target.value));
                          e.target.value = '';
                        }
                      }}
                      style={{
                        padding: '0.25rem',
                        margin: '0.125rem',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    >
                      <option value="">+ Assign Role</option>
                      {roles.filter(role => !user.roles.some(ur => ur.id === role.id)).map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.roles.some(r => r.name === 'superadmin')}
                      style={{
                        padding: '0.25rem 0.5rem',
                        margin: '0.125rem',
                        backgroundColor: user.roles.some(r => r.name === 'superadmin') ? '#9ca3af' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: user.roles.some(r => r.name === 'superadmin') ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem'
                      }}
                      title={user.roles.some(r => r.name === 'superadmin') ? 'Cannot delete superadmin' : 'Delete user'}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f9fafb'
          }}>
            <span>
              Showing {users.length} of {pagination.total} users
            </span>
            <div>
              <button
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                disabled={filters.page <= 1}
                style={{
                  padding: '0.5rem',
                  margin: '0 0.25rem',
                  backgroundColor: filters.page <= 1 ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: filters.page <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ⬅️ Previous
              </button>
              <span style={{ margin: '0 1rem' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                disabled={filters.page >= pagination.totalPages}
                style={{
                  padding: '0.5rem',
                  margin: '0 0.25rem',
                  backgroundColor: filters.page >= pagination.totalPages ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: filters.page >= pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                ➡️ Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>➕ Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>👤 Name:</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                  placeholder="Enter full name"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>✉️ Email:</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                  placeholder="user@example.com"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>🔒 Password:</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                  placeholder="Enter password"
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>🏷️ Roles:</label>
                <select
                  multiple
                  value={createForm.roleIds}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                    setCreateForm({...createForm, roleIds: values});
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    minHeight: '100px'
                  }}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <small style={{ color: '#6b7280' }}>Hold Ctrl/Cmd to select multiple roles</small>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;