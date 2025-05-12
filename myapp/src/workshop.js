import React, { useEffect, useState } from 'react';
import Sidebar from './sidebarscad';

const WorkshopPage = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const [workshops, setWorkshops] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [newWorkshop, setNewWorkshop] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    speaker: '',
    agenda: ''
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('workshops')) || [];
    setWorkshops(stored);
  }, []);

  const saveToLocalStorage = (updated) => {
    localStorage.setItem('workshops', JSON.stringify(updated));
    setWorkshops(updated);
  };

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      setEditIndex(index);
      setNewWorkshop(workshops[index]);
    } else {
      setEditIndex(null);
      setNewWorkshop({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        speaker: '',
        agenda: ''
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newWorkshop.name.trim()) newErrors.name = 'Workshop name is required.';
    if (!newWorkshop.description.trim()) newErrors.description = 'Description is required.';
    if (!newWorkshop.startDate) newErrors.startDate = 'Start date is required.';
    if (!newWorkshop.endDate) newErrors.endDate = 'End date is required.';
    if (!newWorkshop.startTime) newErrors.startTime = 'Start time is required.';
    if (!newWorkshop.endTime) newErrors.endTime = 'End time is required.';
    if (!newWorkshop.speaker.trim()) newErrors.speaker = 'Speaker bio is required.';
    if (!newWorkshop.agenda.trim()) newErrors.agenda = 'Agenda is required.';
    return newErrors;
  };

  const handleSave = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    let updated;
    if (editIndex !== null) {
      updated = [...workshops];
      updated[editIndex] = newWorkshop;
    } else {
      updated = [...workshops, newWorkshop];
    }

    saveToLocalStorage(updated);
    setModalOpen(false);
    setErrors({});
  };

  const handleDelete = (index) => {
    const updated = workshops.filter((_, i) => i !== index);
    saveToLocalStorage(updated);
  };

  const inputStyle = {
    marginBottom: '10px',
    padding: '8px',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid #ccc'
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

        <h2>Manage Workshops</h2>
        <button onClick={() => handleOpenModal()} style={{ padding: '10px 15px', marginBottom: '20px' }}>
          Add Workshop
        </button>

        <h3>All Workshops</h3>
        {workshops.length === 0 ? (
          <p>No workshops available.</p>
        ) : (
          workshops.map((ws, index) => (
            <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h4>{ws.name}</h4>
              <p><strong>Description:</strong> {ws.description}</p>
              <p><strong>Date:</strong> {new Date(ws.startDate).toDateString()} to {new Date(ws.endDate).toDateString()}</p>
              <p><strong>Time:</strong> {ws.startTime} – {ws.endTime}</p>
              <p><strong>Speaker:</strong> {ws.speaker}</p>
              <p><strong>Agenda:</strong> {ws.agenda}</p>
              <button onClick={() => handleOpenModal(index)} style={{ marginRight: '10px' }}>Edit</button>
              <button onClick={() => handleDelete(index)} style={{ color: 'red' }}>Delete</button>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>{editIndex !== null ? 'Edit' : 'Add'} Workshop</h3>

            <input
              type="text"
              placeholder="Workshop Name"
              value={newWorkshop.name}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, name: e.target.value })}
              style={{ ...inputStyle, borderColor: errors.name ? 'red' : '#ccc' }}
            />
            {errors.name && <div style={{ color: 'red', marginBottom: '10px' }}>{errors.name}</div>}

            <input
              type="text"
              placeholder="Short Description"
              value={newWorkshop.description}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
              style={{ ...inputStyle, borderColor: errors.description ? 'red' : '#ccc' }}
            />
            {errors.description && <div style={{ color: 'red', marginBottom: '10px' }}>{errors.description}</div>}

            <input
              type="date"
              value={newWorkshop.startDate}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, startDate: e.target.value })}
              style={{ ...inputStyle, borderColor: errors.startDate ? 'red' : '#ccc' }}
            />
            {errors.startDate && <div style={{ color: 'red', marginBottom: '10px' }}>{errors.startDate}</div>}

            <input
              type="date"
              value={newWorkshop.endDate}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, endDate: e.target.value })}
              style={{ ...inputStyle, borderColor: errors.endDate ? 'red' : '#ccc' }}
            />
            {errors.endDate && <div style={{ color: 'red', marginBottom: '10px' }}>{errors.endDate}</div>}

            <input
              type="time"
              value={newWorkshop.startTime}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, startTime: e.target.value })}
              style={{ ...inputStyle, borderColor: errors.startTime ? 'red' : '#ccc' }}
            />
            {errors.startTime && <div style={{ color: 'red', marginBottom: '10px' }}>{errors.startTime}</div>}

            <input
              type="time"
              value={newWorkshop.endTime}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, endTime: e.target.value })}
              style={{ ...inputStyle, borderColor: errors.endTime ? 'red' : '#ccc' }}
            />
            {errors.endTime && <div style={{ color: 'red', marginBottom: '10px' }}>{errors.endTime}</div>}

            <input
              type="text"
              placeholder="Speaker Bio"
              value={newWorkshop.speaker}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, speaker: e.target.value })}
              style={{ ...inputStyle, borderColor: errors.speaker ? 'red' : '#ccc' }}
            />
            {errors.speaker && <div style={{ color: 'red', marginBottom: '10px' }}>{errors.speaker}</div>}

            <textarea
              placeholder="Workshop Agenda"
              value={newWorkshop.agenda}
              onChange={(e) => setNewWorkshop({ ...newWorkshop, agenda: e.target.value })}
              style={{ ...inputStyle, height: '80px', borderColor: errors.agenda ? 'red' : '#ccc' }}
            />
            {errors.agenda && <div style={{ color: 'red', marginBottom: '10px' }}>{errors.agenda}</div>}

            <div style={{ marginTop: '10px' }}>
              <button onClick={handleSave} style={{ marginRight: '10px' }}>
                Save
              </button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '90vh', // <-- limits height
  overflowY: 'auto', // <-- enables scroll
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
};


export default WorkshopPage;
