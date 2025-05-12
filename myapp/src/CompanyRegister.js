import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

function CompanyRegister() {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyEmail, setCompanyEmail] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const maxCompanies = 50;

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    setDocumentFile(file || null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    setCompanyLogoFile(file || null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!companyName) newErrors.companyName = 'Company name is required';
    if (!industry) newErrors.industry = 'Industry is required';
    if (!companySize) newErrors.companySize = 'Company size is required';
    if (!companyLogoFile) newErrors.companyLogo = 'Company logo is required';
    if (!companyEmail) newErrors.companyEmail = 'Email is required';
    else if (!emailRegex.test(companyEmail)) newErrors.companyEmail = 'Invalid email format';
    if (!documentFile) newErrors.document = 'Document is required';
    if (!password) newErrors.password = 'Password is required';

    // File size checks
    if (companyLogoFile && companyLogoFile.size > 2 * 1024 * 1024) {
      newErrors.companyLogo = 'Logo must be smaller than 2MB';
    }
    if (documentFile && documentFile.size > 5 * 1024 * 1024) {
      newErrors.document = 'Document must be smaller than 5MB';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    const existingLocal = JSON.parse(localStorage.getItem('companies')) || [];
    const emailExists = existingLocal.some((company) => company.companyEmail === companyEmail);

    if (emailExists) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        companyEmail: 'Email already in use. Please use a different email.',
      }));
      return;
    }

    try {
      console.log('Converting logo and document to base64...');
      const companyLogoBase64 = await fileToBase64(companyLogoFile);
      const documentBase64 = await fileToBase64(documentFile);

      const fullCompany = {
        companyName,
        industry,
        companySize,
        companyLogo: companyLogoBase64,
        companyEmail,
        document: {
          name: documentFile.name,
          dataUrl: documentBase64,
        },
        password,
        isAccepted: false,
        hasNotification: false,
        jobs: [],
        role: 'company',
      };


      if (existingLocal.length >= maxCompanies) {
        existingLocal.shift();
      }

      existingLocal.push(fullCompany);
      localStorage.setItem('companies', JSON.stringify(existingLocal));
      localStorage.setItem('currentCompany', JSON.stringify(fullCompany));
      localStorage.setItem('companiesUpdated', Date.now());
      const user= JSON.parse(localStorage.getItem('allUsers')) ;
      user.push(fullCompany);
      localStorage.setItem('allUsers', JSON.stringify(user));
      const t=JSON.parse(localStorage.getItem('allUsers')) ;
      console.log(t);


      const existingSession = JSON.parse(sessionStorage.getItem('companies')) || [];
      existingSession.push(fullCompany);
      sessionStorage.setItem('companies', JSON.stringify(existingSession));

      setUser(fullCompany);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error processing files:', error);
      setErrors({ general: 'Failed to process files. Please try again or use smaller files.' });
    }
  };

  const handleModalOkClick = () => {
    setIsModalOpen(false);
    if (user) {
      navigate('/company-login', { state: { company:user } });
    }
  };

  const inputStyle = (err) => ({
    width: '100%',
    padding: '8px',
    marginBottom: '5px',
    border: err ? '1px solid red' : '1px solid #ccc',
    borderRadius: '4px',
  });

  const errorText = (msg) => (
    <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{msg}</div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <div style={{
        width: '400px',
        padding: '30px',
        marginTop: '40px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ textAlign: 'center', color: '#385e72' }}>Company Register</h2>
        <form onSubmit={handleRegister}>
          <div>
            <label>Company Name:</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle(errors.companyName)} />
            {errors.companyName && errorText(errors.companyName)}
          </div>
          <div>
            <label>Industry:</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle(errors.industry)} />
            {errors.industry && errorText(errors.industry)}
          </div>
          <div>
            <label>Company Size:</label>
            <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} style={inputStyle(errors.companySize)}>
              <option value="">Select company size</option>
              <option value="small">Small (≤50)</option>
              <option value="medium">Medium (51–100)</option>
              <option value="large">Large (101–500)</option>
              <option value="corporate">Corporate (500+)</option>
            </select>
            {errors.companySize && errorText(errors.companySize)}
          </div>
          <div>
            <label>Company Logo:</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} style={inputStyle(errors.companyLogo)} />
            {errors.companyLogo && errorText(errors.companyLogo)}
            {companyLogoFile && (
              <img src={URL.createObjectURL(companyLogoFile)} alt="Logo Preview"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginTop: '8px' }} />
            )}
          </div>
          <div>
            <label>Email:</label>
            <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} style={inputStyle(errors.companyEmail)} />
            {errors.companyEmail && errorText(errors.companyEmail)}
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle(errors.password)} />
            {errors.password && errorText(errors.password)}
          </div>
          <div>
            <label>Upload Document:</label>
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleDocumentChange} style={inputStyle(errors.document)} />
            {errors.document && errorText(errors.document)}
            {documentFile && <p style={{ fontSize: '12px' }}>Selected: {documentFile.name}</p>}
          </div>
          <button type="submit"
            style={{
              marginTop: 10,
              width: '100%',
              padding: '10px',
              backgroundColor: '#385e72',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Register
          </button>
          {errors.general && errorText(errors.general)}
        </form>

        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 8,
              width: '300px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#385e72' }}>Registration Successful!</h3>
              <p>Await SCAD approval.</p>
              <button onClick={handleModalOkClick}
                style={{
                  marginTop: 10,
                  backgroundColor: '#385e72',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyRegister;
