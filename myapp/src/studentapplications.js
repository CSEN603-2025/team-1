import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

function MyApplications() {
  const [myApplications, setMyApplications] = useState([]);
  const location=useLocation();
  // const savedProfile = JSON.parse(localStorage.getItem('studentProfile'));
  const savedProfile=location.state?.studentj;

  const loadApplications = useCallback(() => {
    const storedApplied = JSON.parse(localStorage.getItem('appliedInternships') );
    if (savedProfile?.email) {
      const studentApps = storedApplied.filter(app => 
        app.studentProfile?.email === savedProfile.email
      );
      setMyApplications(studentApps);
    }
  }, [savedProfile]);

  useEffect(() => {
    // Load immediately
    loadApplications();

    // Set up event listeners
    const handleStatusUpdate = (e) => {
      if (e.detail?.applicantEmail === savedProfile?.email) {
        loadApplications();
      }
    };

    const handleStorageChange = () => {
      loadApplications();
    };

    window.addEventListener('applicationStatusUpdated', handleStatusUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('applicationStatusUpdated', handleStatusUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadApplications, savedProfile]);

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
          minWidth: '350px',
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
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px 15px' }}>{appliedJob.companyName}</td>
                <td style={{ padding: '12px 15px' }}>{appliedJob.title}</td>
                <td style={{ padding: '12px 15px' }}>{appliedJob.duration}</td>
                <td style={{ padding: '12px 15px' }}>{appliedJob.isPaid ? 'Yes' : 'No'}</td>
                <td style={{ padding: '12px 15px' }}>
                  <span style={{
                    fontWeight: 'bold',
                    color: appliedJob.status === 'accepted' ? 'green' :
                      appliedJob.status === 'rejected' ? 'red' :
                        appliedJob.status === 'finalized' ? 'blue' :
                          'orange'
                  }}>
                    {appliedJob.status || 'pending'}
                  </span>
                </td>
                <td style={{ padding: '12px 15px' }}>
                  {appliedJob.documents && appliedJob.documents.length > 0
                    ? appliedJob.documents.join(', ')
                    : 'No documents uploaded'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No internships applied to yet.</p>
      )}
    </div>
  );
}

export default MyApplications;