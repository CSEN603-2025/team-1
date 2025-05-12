import React, { useState, useEffect } from 'react';
import Sidebar from './sidebarscad'; // Ensure correct import path

const AllStudents = () => {
  const [menuOpen, setMenuOpen] = useState(() => {
    const storedMenuState = localStorage.getItem('menuOpen');
    return storedMenuState === 'true';
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [visibleStudentIndex, setVisibleStudentIndex] = useState(null);
  
  const students = JSON.parse(localStorage.getItem('studentusers'));
   sessionStorage.setItem("studentList", JSON.stringify(students));
   useEffect(() => {
  if (performance.navigation.type === 1) {
    console.log('Page was reloaded');
    const student= JSON.parse(sessionStorage.getItem('studentList')) ;
    console.log('Updated student users in localStorage:', student);
    // You can re-fetch sessionStorage/localStorage or do any logic here
  }
}, []);

  useEffect(() => {
    let student = JSON.parse(localStorage.getItem('studentusers'));
    if (!Array.isArray(student) || student.length === 0) {
        student= JSON.parse(sessionStorage.getItem('studentList')) ;
    }
    sessionStorage.setItem("studentList", JSON.stringify(student));

  }, [students]);

  const savedList = JSON.parse(sessionStorage.getItem("studentList")) || [];


  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const filteredStudents = statusFilter
    ? savedList.filter(student => student.status === statusFilter)
    : savedList;

  const toggleMenu = () => {
    setMenuOpen(prev => {
      const newState = !prev;
      localStorage.setItem('menuOpen', newState.toString());
      return newState;
    });
  };

  const toggleStudentDetails = (index) => {
    setVisibleStudentIndex(prevIndex => prevIndex === index ? null : index);
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
          marginLeft: menuOpen ? '250px' : '0',
        }}
      >
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
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            display: menuOpen ? 'none' : 'block',
          }}
        >
          ☰
        </button>

        <h2>All Students</h2>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="statusFilter" style={{ marginRight: '10px' }}>Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ padding: '5px', borderRadius: '5px' }}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>

        {filteredStudents.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {filteredStudents.map((student, index) => (
              <li key={index} style={{ marginBottom: '15px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <h3
                  style={{ cursor: 'pointer', color: '#385e72' }}
                  onClick={() => toggleStudentDetails(index)}
                >
                  {student.name}
                </h3>
                {visibleStudentIndex === index && (
                  <>
                    <p><strong>Email:</strong> {student.email}</p>
                    <p><strong>Interests:</strong> {student.jobInterests}</p>
                    <p><strong>Previous Internships:</strong> {student.internships}</p>
                    <p><strong>Part-Time Jobs:</strong> {student.partTimeJobs}</p>
                    <p><strong>College Activities:</strong> {student.collegeActivities}</p>
                    <p><strong>Status:</strong> {student.status}</p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllStudents;
