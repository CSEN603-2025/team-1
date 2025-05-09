import React, { useState, useEffect, useMemo } from 'react';

function ViewRegistration({ setNotificationMessage }) {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [industryOptions, setIndustryOptions] = useState([]);

  const loadPendingCompanies = () => {
    try {
      const all = JSON.parse(localStorage.getItem('companies')) || [];
      const pending = all.filter(company => !company.isAccepted);
      console.log('Loaded companies:', pending);
      setCompanies(pending);

      const uniqueIndustries = [...new Set(pending.map(c => c.industry))].filter(Boolean);
      setIndustryOptions(uniqueIndustries);
    } catch (error) {
      console.error('Error loading companies from localStorage:', error);
    }
  };

  useEffect(() => {
    console.log('Component mounted');
    loadPendingCompanies();

    const onStorage = (e) => {
      if (e.key === 'companies' || e.key === 'companiesUpdated') {
        console.log('Storage event detected');
        loadPendingCompanies();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleAccept = () => {
    console.log('Accepting company:', companyDetails);
    if (!companyDetails) return;
    const all = JSON.parse(localStorage.getItem('companies')) || [];
    const updated = all.map(c =>
      c.companyEmail === companyDetails.companyEmail
        ? { ...c, isAccepted: true, hasNotification: true }
        : c
    );
    localStorage.setItem('companies', JSON.stringify(updated));
    localStorage.setItem('companiesUpdated', Date.now());
    setNotificationMessage?.(`Registration for ${companyDetails.companyName} accepted.`);
    setCompanies(prev => prev.filter(c => c.companyEmail !== companyDetails.companyEmail));
    setCompanyDetails(null);
  };

  const handleReject = () => {
    console.log('Rejecting company:', companyDetails);
    if (!companyDetails) return;
    const all = JSON.parse(localStorage.getItem('companies')) || [];
    const updated = all.filter(c => c.companyEmail !== companyDetails.companyEmail);
    localStorage.setItem('companies', JSON.stringify(updated));
    localStorage.setItem('companiesUpdated', Date.now());
    setNotificationMessage?.(`Registration for ${companyDetails.companyName} rejected.`);
    setCompanies(prev => prev.filter(c => c.companyEmail !== companyDetails.companyEmail));
    setCompanyDetails(null);
  };

  const handleDownloadDocument = (doc) => {
    const link = document.createElement('a');
    link.href = doc.dataUrl;
    link.download = doc.name;
    link.click();
  };
  
  
  const filtered = useMemo(() =>
    companies.filter(c =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedIndustry ? c.industry === selectedIndustry : true)
    ),
    [companies, searchQuery, selectedIndustry]
  );

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#385e72' }}>Pending Company Registrations</h1>

      <div style={{ textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ padding: '10px', width: '90%', maxWidth: '300px', margin: '10px auto', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button
          onClick={() => setSelectedIndustry('')}
          style={{
            backgroundColor: selectedIndustry === '' ? '#6aabd2' : '#b7cfdc',
            color: '#385e72',
            marginRight: '10px',
            border: '1px solid #6aabd2',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer'
          }}
        >
          All Industries
        </button>
        <select
          value={selectedIndustry}
          onChange={e => setSelectedIndustry(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Select Industry</option>
          {industryOptions.map((i, idx) => (
            <option key={idx} value={i}>{i}</option>
          ))}
        </select>
      </div>

      <div style={{ textAlign: 'center', margin: '20px' }}>
        {filtered.length ? filtered.map(c => (
          <p key={c.companyEmail} style={{ marginBottom: '20px' }}>
            <div
              onClick={() => setCompanyDetails(c)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                color: '#385e72',
                textDecoration: 'none',
                cursor: 'pointer',
                padding: '10px 20px',
                minWidth: '300px'
              }}
            >
              {c.companyLogo && (
                <img
                  src={c.companyLogo}
                  alt={`${c.companyName} logo`}
                  style={{
                    width: '50px',
                    height: '50px',
                    marginRight: '15px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
              <span style={{ fontWeight: 'bold' }}>{c.companyName}</span>
            </div>
          </p>
        )) : (
          <p>No pending registrations.</p>
        )}
      </div>

      {companyDetails && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: '350px', height: '100vh',
          backgroundColor: '#b7cfdc', boxShadow: '-2px 0 5px rgba(0,0,0,0.2)',
          padding: '20px', overflowY: 'auto', zIndex: 1000
        }}>
          <button
            onClick={() => setCompanyDetails(null)}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              backgroundColor: '#385e72', color: 'white', border: 'none', cursor: 'pointer',
              borderRadius: '4px', padding: '5px 10px'
            }}
          >
            Close
          </button>
          <h2 style={{ textAlign: 'center', color: '#385e72' }}>Company Details</h2>

          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            {companyDetails.companyLogo ? (
              <img
                src={companyDetails.companyLogo}
                alt={`${companyDetails.companyName} logo`}
                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : <p>No logo uploaded</p>}
            <h3 style={{ fontSize: '24px', color: '#385e72' }}>{companyDetails.companyName}</h3>
          </div>

          <p><strong>Industry:</strong> {companyDetails.industry}</p>
          <p><strong>Size:</strong> {companyDetails.companySize}</p>
          <p><strong>Email:</strong> {companyDetails.companyEmail}</p>

          {companyDetails.document && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => handleDownloadDocument(companyDetails.document)}
                style={{
                  padding: '10px 20px', backgroundColor: '#6aabd2',
                  color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
                }}
              >
                Download Document
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
            <button
              onClick={handleAccept}
              style={{
                padding: '10px 20px', backgroundColor: '#4CAF50',
                color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
              }}
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              style={{
                padding: '10px 20px', backgroundColor: '#f44336',
                color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRegistration;
