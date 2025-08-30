import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getSummary();
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color = '#3b82f6', icon }) => (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: `3px solid ${color}20`
    }}>
      <div style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: color,
        marginBottom: '0.5rem'
      }}>
        {icon} {value}
      </div>
      <div style={{
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.25rem'
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2>📊 Analytics Dashboard</h2>
        <button
          onClick={fetchAnalytics}
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading analytics...</div>
      ) : analytics ? (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <StatCard
              title="Total Users"
              value={analytics.summary.totalUsers}
              subtitle="All registered users"
              color="#10b981"
              icon="👥"
            />
            <StatCard
              title="Active Users"
              value={analytics.summary.activeUsers7d}
              subtitle="Logged in last 7 days"
              color="#3b82f6"
              icon="🟢"
            />
            <StatCard
              title="New Users"
              value={analytics.summary.newUsers7d}
              subtitle="Created last 7 days"
              color="#8b5cf6"
              icon="🆕"
            />
            <StatCard
              title="Total Roles"
              value={analytics.summary.totalRoles}
              subtitle="Available roles"
              color="#f59e0b"
              icon="🏷️"
            />
            <StatCard
              title="Recent Activity"
              value={analytics.summary.recentActivity24h}
              subtitle="Actions last 24 hours"
              color="#ef4444"
              icon="⚡"
            />
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>ℹ️ System Information</h3>
            <p><strong>Last Updated:</strong> {new Date(analytics.timestamp).toLocaleString()}</p>
            <p><strong>Environment:</strong> Development</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Analytics;