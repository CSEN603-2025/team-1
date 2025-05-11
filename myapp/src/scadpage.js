import React, { useState, useEffect } from 'react';
import Sidebar from './sidebarscad';

function SCADPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const toggleMenu = () => setMenuOpen(prev => !prev);

  useEffect(() => {
    const savedStart = localStorage.getItem('scadStartDate');
    const savedEnd = localStorage.getItem('scadEndDate');
    if (savedStart && savedEnd) {
      setStartDate(savedStart);
      setEndDate(savedEnd);
    }
  }, []);

  const handleDateSubmit = () => {
    localStorage.setItem('scadStartDate', startDate);
    localStorage.setItem('scadEndDate', endDate);
    setShowDateModal(false);
  };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} />
    
      <div
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          transition: 'margin-left 0.3s ease',
          marginLeft: menuOpen ? '250px' : '0', // Push content to the right when sidebar is open
        }}
      >
        {/* Button to toggle sidebar */}
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
            position: 'fixed',  // Keep button fixed in position
            top: '20px',        // Distance from top of the screen
            left: '20px',       // Distance from left of the screen
            zIndex: 1000,       // Ensure it's on top of other elements
            display: menuOpen ? 'none' : 'block',  // Hide button when sidebar is open
          }}
        >
          ☰
        </button>

        <h1 style={{ color: '#385e72' }}>SCAD Page Content</h1>
        <p style={{ color: '#333' }}>Insert your page content here. Customize as needed.</p>

        {!(startDate && endDate) && (
          <button
            onClick={() => setShowDateModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#385e72',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Set Start & End Date
          </button>
        )}

        {startDate && endDate && (
          <div style={{ marginTop: '20px', color: '#333' }}>
            <strong>Selected Date Range:</strong> {startDate} to {endDate}
          </div>
        )}
      </div>

      {/* Date Range Modal */}
      {showDateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              width: '300px',
            }}
          >
            <h3>Select Date Range</h3>
            <label>
              Start Date:
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <br />
            <label>
              End Date:
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
            <br />
            <br />
            <button
              onClick={handleDateSubmit}
              style={{
                marginRight: '10px',
                padding: '5px 10px',
                backgroundColor: '#385e72',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => setShowDateModal(false)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#ccc',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SCADPage;
