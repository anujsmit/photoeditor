import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('bard_photo_editor_recent_projects');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: '#0e0c16',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '22px', marginBottom: '10px', color: '#c084fc', fontWeight: 700 }}>
            BARD Photo Editor
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: '14px', maxWidth: '500px', fontSize: '13px', lineHeight: 1.5 }}>
            The editor encountered a temporary rendering issue. Click below to safely restore your workspace.
          </p>
          {this.state.error && (
            <pre style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '11px',
              maxWidth: '600px',
              maxHeight: '140px',
              overflow: 'auto',
              textAlign: 'left',
              marginBottom: '16px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {this.state.error.message || String(this.state.error)}
              {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            Reload Editor
          </button>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              background: 'transparent',
              color: '#6b7280',
              fontSize: '11px',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Reset cache and start fresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

