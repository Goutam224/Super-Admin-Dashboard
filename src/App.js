import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import UsersList from './components/UsersList';
import AuditLogs from './components/AuditLogs';
import Analytics from './components/Analytics';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('analytics');

  useEffect(() => {
    // Check for existing login
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        padding: '1rem 2rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ margin: '0', marginRight: '2rem', color: '#1f2937' }}>
            🛡️ Super Admin
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setCurrentView('analytics')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentView === 'analytics' ? '#3b82f6' : 'transparent',
                color: currentView === 'analytics' ? 'white' : '#4b5563',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setCurrentView('users')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentView === 'users' ? '#3b82f6' : 'transparent',
                color: currentView === 'users' ? 'white' : '#4b5563',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              👥 Users
            </button>
            <button
              onClick={() => setCurrentView('audit')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentView === 'audit' ? '#3b82f6' : 'transparent',
                color: currentView === 'audit' ? 'white' : '#4b5563',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📋 Audit Logs
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '4px',
            border: '1px solid #bbf7d0'
          }}>
            <span style={{ color: '#15803d', fontSize: '0.875rem' }}>
              👋 Welcome, <strong>{user.name}</strong>
            </span>
            <br />
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              {user.roles.map(role => role.name).join(', ')}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'analytics' && <Analytics />}
        {currentView === 'users' && <UsersList />}
        {currentView === 'audit' && <AuditLogs />}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        padding: '1rem 2rem',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        color: '#6b7280',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <span>🎉 Super Admin Dashboard</span>
          <span>🔧 Built with Node.js + React</span>
          <span>📊 Current View: {currentView}</span>
          <span>⏰ {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;