import React from 'react';
import { useNavigate } from 'react-router-dom';

const FacultyPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Redirect the user to the login page after logout
    navigate('/');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Welcome to Faculty Page</h2>
      <p>This is the Faculty page, accessible only to faculty users.</p>
      <button 
        onClick={handleLogout}
        style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Logout
      </button>
    </div>
  );
};

export default FacultyPage;
