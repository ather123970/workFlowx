import React from 'react';

const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f9ff'
    }}>
      <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
        🚀 WorkFlowX is Loading...
      </h1>
      <p style={{ color: '#374151', fontSize: '18px', marginBottom: '30px' }}>
        AI-Powered Study Notes Generator
      </p>
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px'
      }}>
        <h2 style={{ color: '#059669', marginBottom: '15px' }}>✅ React is Working!</h2>
        <p style={{ color: '#6b7280' }}>
          If you see this message, React is successfully rendering. 
          The main app will load shortly.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Reload App
        </button>
      </div>
    </div>
  );
};

export default TestApp;
