import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate

function MyApplications() {
  const [myApplications, setMyApplications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate(); // Added useNavigate
  const savedProfile = location.state?.studentj || location.state?.student;

  const loadApplications = useCallback(() => {
    // Ensure storedApplied is an array, defaulting to [] if not found or invalid
    const storedAppliedString = localStorage.getItem('appliedInternships');
    const storedApplied = storedAppliedString ? JSON.parse(storedAppliedString) : []; // Default to []

    if (savedProfile?.email) {
      // Now storedApplied is guaranteed to be an array, so .filter will work
      const studentApps = storedApplied.filter(app => 
        app.studentProfile?.email === savedProfile.email
      );
      setMyApplications(studentApps);
    } else {
      setMyApplications([]); // Clear applications if no profile
    }
  }, [savedProfile]);

  useEffect(() => {
    loadApplications();

    const handleStatusUpdate = (e) => {
      // Ensure savedProfile is available before accessing email
      if (savedProfile && e.detail?.applicantEmail === savedProfile.email) {
        loadApplications();
      }
    };

    const handleStorageChange = (event) => {
      // Specifically check if the 'appliedInternships' key changed
      if (event.key === 'appliedInternships' || event.key === null) { // null for clearStorage
         loadApplications();
      }
    };

    window.addEventListener('applicationStatusUpdated', handleStatusUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('applicationStatusUpdated', handleStatusUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadApplications, savedProfile]);

  // --- Add a Back Button Handler ---
  const handleBack = () => {
    // Navigate back to the student page, ensuring student data is passed back
    navigate('/studentpage', { state: { student: savedProfile } }); 
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '30px auto',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#28a745' }}>My Applications</h1>

      {myApplications.length > 0 ? (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden',
          minWidth: '600px', // Adjusted minWidth for better layout
        }}>
          <thead style={{ backgroundColor: '#28a745', color: 'white' }}>
            <tr>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Company</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Duration</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Paid</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Documents</th>
            </tr>
          </thead>
          <tbody>
            {myApplications.map((appliedJob, index) => (
              // Use a more stable key if available, like an application ID
              <tr key={appliedJob.id || `${appliedJob.title}-${index}`} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px 15px' }}>{appliedJob.companyName}</td>
                <td style={{ padding: '12px 15px' }}>{appliedJob.title}</td>
                <td style={{ padding: '12px 15px' }}>{appliedJob.duration}</td>
                <td style={{ padding: '12px 15px' }}>{appliedJob.isPaid ? 'Yes' : 'No'}</td>
                <td style={{ padding: '12px 15px' }}>
                  <span style={{
                    fontWeight: 'bold',
                    padding: '4px 8px', // Added padding for better visual
                    borderRadius: '4px', // Added border radius
                    color: 'white', // Text color to white for better contrast on bg
                    backgroundColor: appliedJob.status === 'accepted' ? 'green' :
                      appliedJob.status === 'rejected' ? 'red' :
                        appliedJob.status === 'finalized' ? 'blue' : // Assuming finalized means something like "shortlisted"
                          'orange' // For pending or other statuses
                  }}>
                    {(appliedJob.status || 'pending').toUpperCase()} {/* Make status uppercase */}
                  </span>
                </td>
                <td style={{ padding: '12px 15px' }}>
                  {appliedJob.documents && appliedJob.documents.length > 0
                    ? appliedJob.documents.join(', ')
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#777' }}>
          You have not applied to any internships yet.
        </p>
      )}
      {/* --- Add a Back Button --- */}
      <button 
        onClick={handleBack} 
        style={{ 
          marginTop: '30px', 
          padding: '10px 20px', 
          backgroundColor: '#6c757d', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer',
          fontSize: '1em'
        }}
      >
        ← Back to Student Page
      </button>
    </div>
  );
}

export default MyApplications;