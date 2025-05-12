import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function CompanyInterns() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Get data from location.state
  const { acceptedInterns: initialInterns = [], storedCompany } = location.state || {};
  const [interns, setInterns] = useState(initialInterns);

  // Load interns from localStorage on component mount
  useEffect(() => {
    if (storedCompany?.companyEmail) {
      const companyInternsKey = `companyInterns_${storedCompany.companyEmail}`;
      const storedInterns = JSON.parse(localStorage.getItem(companyInternsKey)) || [];
      setInterns(storedInterns);
    }
  }, [storedCompany]);

  // Update intern status in both state and localStorage
  const updateInternStatus = (email, newStatus) => {
    if (!storedCompany?.companyEmail) return;
    
    const updatedInterns = interns.map(intern => {
      if (intern.email === email) {
        return { ...intern, status: newStatus };
      }
      return intern;
    });
    
    setInterns(updatedInterns);
    
    // Update in localStorage
    const companyInternsKey = `companyInterns_${storedCompany.companyEmail}`;
    localStorage.setItem(companyInternsKey, JSON.stringify(updatedInterns));
  };

  // Filter interns based on search term and status
  const filteredInterns = interns.filter(intern => {
    const matchesSearch = 
      intern.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      intern.status === statusFilter ||
      (!intern.status && statusFilter === 'current');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: '10px',
      backgroundColor: '#fff',
      minHeight: 'calc(100vh - 40px)',
      boxSizing: 'border-box',
    }}>
      <h1 style={{ textAlign: 'center', color: '#28a745', marginBottom: '20px' }}>
        Your Interns
      </h1>

      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '25px',
        justifyContent: 'space-between'
      }}>
        <div style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search by name or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ flex: '1', minWidth: '250px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '16px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Interns</option>
            <option value="current">Current Interns</option>
            <option value="completed">Internship Completed</option>
          </select>
        </div>
      </div>

      {filteredInterns.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#555' }}>
          No interns found matching your criteria.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredInterns.map((intern, index) => (
            <li key={index} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px 20px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              backgroundColor: '#f9f9f9',
              wordBreak: 'break-word',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '5px 10px',
                borderRadius: '4px',
                backgroundColor: intern.status === 'completed' ? '#28a745' : '#007bff',
                color: 'white',
                fontSize: '14px'
              }}>
                {intern.status === 'completed' ? 'Completed' : 'Current'}
              </div>
              
              <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#333' }}>
                {intern.name || 'No Name Provided'}
              </h2>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Email:</strong> {intern.email || 'N/A'}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Job Title:</strong> {intern.jobTitle || 'N/A'}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Duration:</strong> {intern.jobDuration || 'N/A'}
              </p>
              
              {/* Status Buttons */}
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => updateInternStatus(intern.email, 'current')}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: intern.status !== 'completed' ? '#007bff' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  disabled={intern.status !== 'completed'}
                >
                  Mark as Current
                </button>
                <button
                  onClick={() => updateInternStatus(intern.email, 'completed')}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: intern.status === 'completed' ? '#28a745' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  disabled={intern.status === 'completed'}
                >
                  Mark as Completed
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button 
        onClick={() => navigate(-1)}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '100%',
          maxWidth: '300px',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default CompanyInterns;