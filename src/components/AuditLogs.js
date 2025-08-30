import React, { useState, useEffect } from 'react';
import { auditAPI } from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    action: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await auditAPI.getAuditLogs(filters);
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      LOGIN: '🔐',
      ASSIGN_ROLE: '🏷️'
    };
    return icons[action] || '❓';
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: '#10b981',
      UPDATE: '#f59e0b',
      DELETE: '#ef4444',
      LOGIN: '#3b82f6',
      ASSIGN_ROLE: '#8b5cf6'
    };
    return colors[action] || '#6b7280';
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2>📋 Audit Logs</h2>
        <button
          onClick={fetchAuditLogs}
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
        gridTemplateColumns: '1fr 1fr 1fr auto',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <select
          value={filters.action}
          onChange={(e) => setFilters({...filters, action: e.target.value, page: 1})}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        >
          <option value="">All Actions</option>
          <option value="CREATE">➕ Create</option>
          <option value="UPDATE">✏️ Update</option>
          <option value="DELETE">🗑️ Delete</option>
          <option value="LOGIN">🔐 Login</option>
          <option value="ASSIGN_ROLE">🏷️ Assign Role</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({...filters, startDate: e.target.value, page: 1})}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
          title="Start Date"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({...filters, endDate: e.target.value, page: 1})}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
          title="End Date"
        />

        <button
          onClick={() => setFilters({page: 1, limit: 20, action: '', startDate: '', endDate: ''})}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Clear Filters
        </button>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Loading audit logs...</div>
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
                  🕒 Time
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  👤 Who
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  ⚡ Action
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  🎯 Target
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  📝 Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {log.actor ? `${log.actor.name}` : 'System'}
                    <br />
                    <small style={{ color: '#6b7280' }}>
                      {log.actor?.email}
                    </small>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: getActionColor(log.action) + '20',
                      color: getActionColor(log.action),
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {getActionIcon(log.action)} {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {log.targetType} {log.targetId ? `#${log.targetId}` : ''}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', maxWidth: '200px' }}>
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <details>
                        <summary style={{ cursor: 'pointer', color: '#3b82f6' }}>
                          📄 View Details
                        </summary>
                        <div style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.75rem',
                          backgroundColor: '#f9fafb',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          overflow: 'auto',
                          maxHeight: '100px'
                        }}>
                          {Object.entries(log.details).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>No details</span>
                    )}
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
              Showing {logs.length} of {pagination.total} audit logs
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
    </div>
  );
};

export default AuditLogs;