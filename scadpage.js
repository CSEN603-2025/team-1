import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function SCADPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <div
        style={{
          width: menuOpen ? '250px' : '0',
          height: '100vh',
          backgroundColor: '#e6f0f5', // Light background
          overflowX: 'hidden',
          transition: '0.3s',
          padding: menuOpen ? '20px' : '0',
          boxShadow: menuOpen ? '2px 0 5px rgba(0,0,0,0.2)' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        {/* Hyperlinks */}
        {menuOpen && (
          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '50px' }}>
            <li><Link to="/view-registration" style={{ color: '#274472', textDecoration: 'underline', fontWeight: 'bold',fontSize: '17px' }}>Company Registrations</Link></li>
            <li><Link to="/view-students" style={{ color: '#385e72', textDecoration: 'underline', fontWeight: 'bold' }}>View Students</Link></li>
            <li><Link to="/approve-internships" style={{ color: '#385e72', textDecoration: 'underline', fontWeight: 'bold' }}>Approve Internships</Link></li>
            <li><Link to="/messages" style={{ color: '#385e72',textDecoration: 'underline', fontWeight: 'bold' }}>Messages</Link></li>
            <li><Link to="/reports" style={{ color: '#385e72', textDecoration: 'underline', fontWeight: 'bold' }}>Reports</Link></li>
            <li><Link to="/settings" style={{ color: '#385e72', textDecoration: 'underline', fontWeight: 'bold' }}>Settings</Link></li>
            
          </ul>
        )}
        <div style={{ marginTop: 'auto' }}>
          <Link to="/" style={{
            color: '#ff4d4d',
            textDecoration: 'underline',
            display: 'block',
            paddingTop: '360px',
            fontWeight:'bold'
          }}>
            Logout
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: menuOpen ? '250px' : '0', 
        transition: 'margin-left 0.3s', 
        padding: '20px', 
        backgroundColor: '#ffffff', // White background for the main content
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* ☰ Toggle Button */}
        <button
          onClick={toggleMenu}
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 1101,
            position: 'absolute',
            top: '20px',
            left: '20px', // Always on the left
            color: '#385e72', // Text color same as the header
          }}
        >
          ☰
        </button>

        <h1 style={{ color: '#385e72' }}>SCAD Page Content</h1>
        <p style={{ color: '#333' }}>Insert your page content here. Customize as needed.</p>
      </div>
    </div>
  );
}

export default SCADPage;
