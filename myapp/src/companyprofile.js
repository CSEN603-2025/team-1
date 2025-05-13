import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedCompany = location.state?.company || JSON.parse(localStorage.getItem('currentCompany'));
    if (storedCompany) {
      setCompany(storedCompany);
    } else {
      navigate('/company-login');
    }
  }, [location, navigate]);

  const downloadDocument = () => {
    if (company?.document?.dataUrl) {
      const link = document.createElement('a');
      link.href = company.document.dataUrl;
      link.download = company.document.name || 'company_document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (!company) {
    return <div style={{ backgroundColor: '#e6f2ff', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <div style={{ backgroundColor: '#e6f2ff', minHeight: '100vh', padding: '20px' }}>
      {/* Back Button */}
      <button
        onClick={handleBack}
        style={{
            padding: '8px 15px',
            backgroundColor: '#34495E',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
            transition: 'background-color 0.3s'
        }}
      >
        ← Back
      </button>

      <h1 style={{ color: '#34495E' }}>Company Profile</h1>
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '30px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          {company.companyLogo && (
            <img 
              src={company.companyLogo} 
              alt="Company Logo" 
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                objectFit: 'cover', 
                marginRight: '30px',
                border: '3px solid #34495E'
              }} 
            />
          )}
          <div>
            <h2 style={{ color: '#34495E', marginBottom: '5px' }}>{company.companyName}</h2>
            <p style={{ color: '#666' }}>
              <strong>Status:</strong> {company.isAccepted ? (
                <span style={{ color: 'green' }}>Verified</span>
              ) : (
                <span style={{ color: 'orange' }}>Pending Approval</span>
              )}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          <div>
            <h3 style={{ borderBottom: '2px solid #34495E', paddingBottom: '10px', color: '#34495E' }}>Basic Information</h3>
            <div style={{ marginTop: '15px' }}>
              <p><strong>Email:</strong> {company.companyEmail}</p>
              <p><strong>Industry:</strong> {company.industry || 'Not specified'}</p>
              <p><strong>Company Size:</strong> {company.companySize || 'Not specified'}</p>
            </div>
          </div>
          
          <div>
            <h3 style={{ borderBottom: '2px solid #34495E', paddingBottom: '10px', color: '#34495E' }}>Documents</h3>
            <div style={{ marginTop: '15px' }}>
              {company.document ? (
                <div>
                  <p><strong>Document:</strong> {company.document.name}</p>
                  <button 
                    onClick={downloadDocument}
                    style={{
                      padding: '8px 15px',
                      backgroundColor: '#34495E',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '10px',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0f2541'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#34495E'}
                  >
                    Download Document
                  </button>
                </div>
              ) : (
                <p>No document uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;