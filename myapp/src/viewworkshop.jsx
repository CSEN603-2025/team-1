import React, { useEffect, useState } from 'react';
import Sidebar from './sidebarscad';

const ViewWorkshopsPage = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null); // Track selected workshop

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('workshops')) || [];
    setWorkshops(stored);
  }, []);

  const upcomingWorkshops = workshops.filter(ws => new Date(ws.startDate) > new Date());

  const handleWorkshopClick = (index) => {
    setSelectedWorkshop(prevIndex => (prevIndex === index ? null : index)); // Toggle visibility
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />

      <div style={{ flex: 1, padding: '20px' }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            fontSize: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '10px',
            display: menuOpen ? 'none' : 'block'
          }}
        >
          ☰
        </button>

        <h2>Upcoming Online Career Workshops</h2>

        {upcomingWorkshops.length === 0 ? (
          <p>No upcoming workshops available.</p>
        ) : (
          upcomingWorkshops.map((ws, index) => (
            <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h4 onClick={() => handleWorkshopClick(index)} style={{ cursor: 'pointer', color: '#007bff' }}>
                {ws.name}
              </h4>
              
              {/* Show details only if the workshop is selected */}
              {selectedWorkshop === index && (
                <>
                  <p><strong>Description:</strong> {ws.description}</p>
                  <p><strong>Date:</strong> {new Date(ws.startDate).toDateString()} to {new Date(ws.endDate).toDateString()}</p>
                  <p><strong>Time:</strong> {ws.startTime} – {ws.endTime}</p>
                  <p><strong>Speaker:</strong> {ws.speaker}</p>
                  <p><strong>Agenda:</strong> {ws.agenda}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewWorkshopsPage;
