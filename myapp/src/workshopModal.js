import React, { useEffect, useState } from 'react';

const WorkshopModal = ({ isOpen, closeModal }) => {
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('workshops')) || [];
    setWorkshops(stored);
  }, []);

  const upcomingWorkshops = workshops.filter(ws => new Date(ws.startDate) > new Date());

  return isOpen ? (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button onClick={closeModal} style={closeButtonStyle}>×</button>
        <h2>Upcoming Online Career Workshops</h2>

        {upcomingWorkshops.length === 0 ? (
          <p>No upcoming workshops available.</p>
        ) : (
          upcomingWorkshops.map((ws, index) => (
            <div key={index} style={workshopCardStyle}>
              <h4>{ws.name}</h4>
              <p><strong>Description:</strong> {ws.description}</p>
              <p><strong>Date:</strong> {new Date(ws.startDate).toDateString()} to {new Date(ws.endDate).toDateString()}</p>
              <p><strong>Time:</strong> {ws.startTime} – {ws.endTime}</p>
              <p><strong>Speaker:</strong> {ws.speaker}</p>
              <p><strong>Agenda:</strong> {ws.agenda}</p>
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '80%',
  maxWidth: '800px',
  maxHeight: '80vh',
  overflowY: 'auto',
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  fontSize: '30px',
  position: 'absolute',
  top: '10px',
  right: '10px',
  cursor: 'pointer',
};

const workshopCardStyle = {
  marginBottom: '20px',
  padding: '15px',
  border: '1px solid #ccc',
  borderRadius: '8px',
};

export default WorkshopModal;
