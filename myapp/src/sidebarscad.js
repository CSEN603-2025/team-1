import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ menuOpen, toggleMenu }) => {
  const navigate = useNavigate();

  const navButtons = [
    { label: 'Homepage', path: '/scadpage' },
    { label: 'Company Registrations', path: '/view-registration' },
    { label: 'View All Students', path: '/allstudents' },
    { label: 'All Reports', path: '/allreports' },
    { label: 'All Evaluations', path: '/evaluation' },
    { label: 'Approve Internships', path: '/approve-internships' },
    { label: 'Available Internships', path: '/allpostedjobs' },
    { label: 'Messages', path: '/messages' },
    { label: 'Reports', path: '/allreports' },
    { label: 'All Workshops', path: '/workshop' },
    { label: 'Upcoming Workshops', path: '/viewworkshop' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <div
      style={{
        width: menuOpen ? '250px' : '0px',
        height: '100vh',
        backgroundColor: '#e6f0f5',
        overflowX: 'hidden',
        transition: 'width 0.3s',
        padding: menuOpen ? '20px' : '0px',
        boxShadow: menuOpen ? '2px 0 5px rgba(0,0,0,0.2)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Close icon */}
      <button
        onClick={toggleMenu}
        style={{
          fontSize: '28px',
          fontWeight: 'bold',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '20px',
          color: '#385e72',
          alignSelf: 'flex-start',
          display: menuOpen ? 'block' : 'none',
        }}
      >
        x
      </button>

      {/* Navigation Buttons */}
      {menuOpen && (
        <div style={{ marginTop: '50px' }}>
          {navButtons.map((btn) => (
            <button
              key={btn.path}
              onClick={() => navigate(btn.path)}
              style={buttonStyle}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Logout Button */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            ...buttonStyle,
            color: '#ff4d4d',
            backgroundColor: 'transparent',
            border: 'none',
            textDecoration: 'underline',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  backgroundColor: '#e6f0f5',
  color: '#385e72',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '16px',
  textAlign: 'left',
  cursor: 'pointer',
};

export default Sidebar;
