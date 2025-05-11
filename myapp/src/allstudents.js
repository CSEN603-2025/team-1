import React, { useEffect, useState } from 'react';
import Sidebar from './sidebarscad'; // Make sure this path is correct

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to toggle the sidebar menu open/close
  const toggleMenu = () => setMenuOpen(prev => !prev);

  useEffect(() => {
    // Retrieve the array of students from localStorage
    const storedStudents = JSON.parse(localStorage.getItem('studentusers'));
    setStudents(storedStudents || []);
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar menuOpen={menuOpen} />

      <div style={{ marginLeft: menuOpen ? '250px' : '0', transition: 'margin-left 0.3s', padding: '20px', width: '100%' }}>
        {/* Button to toggle the sidebar */}
        <button
          onClick={toggleMenu}
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            top: '20px',
            left: '20px',
            color: '#385e72',
            display: menuOpen ? 'none' : 'block',
          }}
        >
          ☰
        </button>

        <h2>All Students</h2>

        {students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {students.map((student, index) => (
              <li key={index} style={{ marginBottom: '15px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <h3>{student.name}</h3>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Interests:</strong> {student.jobInterests}</p>
                <p><strong>Previous Internships:</strong> {student.internships}</p>
                <p><strong>Part-Time Jobs:</strong> {student.partTimeJobs}</p>
                <p><strong>College Activities:</strong> {student.collegeActivities}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllStudents;
