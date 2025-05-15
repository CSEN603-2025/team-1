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
  // Form state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyEmail, setCompanyEmail] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);

  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const maxCompanies = 50;

  // Industry options
  const industryOptions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Media & Entertainment",
    "Transportation",
    "Construction",
    "Energy",
    "Agriculture",
    "Hospitality",
    "Real Estate",
    "Telecommunications",
    "Consulting"
  ];

  // Color palette
  const colors = {
    primary: {
      main: '#6366f1',
      dark: '#4f46e5',
      light: '#818cf8',
      lighter: '#e0e7ff',
      contrast: '#ffffff'
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#059669'
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#b91c1c'
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706'
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    if (type === 'logo') {
      setIsDraggingLogo(true);
    } else {
      setIsDraggingDoc(true);
    }
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    if (type === 'logo') {
      setIsDraggingLogo(false);
    } else {
      setIsDraggingDoc(false);
    }
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    
    if (type === 'logo') {
      setIsDraggingLogo(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        setCompanyLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      }
    } else {
      setIsDraggingDoc(false);
      const file = e.dataTransfer.files[0];
      const validTypes = ['.pdf', '.docx', '.txt', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const fileType = file.type;
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (file && (validTypes.includes(fileType) || validTypes.includes(fileExt))) {
        setDocumentFile(file);
      }
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!industry) newErrors.industry = 'Industry is required';
      if (!companySize) newErrors.companySize = 'Company size is required';
    } else if (step === 2) {
      if (!companyEmail) newErrors.companyEmail = 'Email is required';
      else if (!emailRegex.test(companyEmail)) newErrors.companyEmail = 'Invalid email format';
      
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    } else if (step === 3) {
      if (!companyLogoFile) newErrors.companyLogo = 'Company logo is required';
      else if (companyLogoFile.size > 2 * 1024 * 1024) {
        newErrors.companyLogo = 'Logo must be smaller than 2MB';
      }
      
      if (!documentFile) newErrors.document = 'Document is required';
      else if (documentFile.size > 5 * 1024 * 1024) {
        newErrors.document = 'Document must be smaller than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    const existingLocal = JSON.parse(localStorage.getItem('companies')) || [];
    const emailExists = existingLocal.some((company) => company.companyEmail === companyEmail);

    if (emailExists) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        companyEmail: 'Email already in use. Please use a different email.',
      }));
      setIsLoading(false);
      return;
    }

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
        createdAt: new Date().toISOString()
      };

      if (existingLocal.length >= maxCompanies) {
        existingLocal.shift();
      }

      existingLocal.push(fullCompany);
      localStorage.setItem('companies', JSON.stringify(existingLocal));
      localStorage.setItem('currentCompany', JSON.stringify(fullCompany));
      localStorage.setItem('companiesUpdated', Date.now());
      
      const users = JSON.parse(localStorage.getItem('allUsers')) || [];
      users.push(fullCompany);
      localStorage.setItem('allUsers', JSON.stringify(users));

      const existingSession = JSON.parse(sessionStorage.getItem('companies')) || [];
      existingSession.push(fullCompany);
      sessionStorage.setItem('companies', JSON.stringify(existingSession));

      setUser(fullCompany);
      setIsLoading(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error processing files:', error);
      setErrors({ general: 'Failed to process files. Please try again or use smaller files.' });
      setIsLoading(false);
    }
  };

  const handleModalOkClick = () => {
    setIsModalOpen(false);
    if (user) {
      navigate('/company-login', { state: { company: user } });
    }
  };

  const renderStepIndicator = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px'
      }}>
        {[1, 2, 3].map((step) => (
          <div key={step} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '33%'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: currentStep >= step ? colors.primary.main : colors.neutral[200],
              color: currentStep >= step ? colors.primary.contrast : colors.neutral[500],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 2
            }}>
              {step}
            </div>
            <div style={{
              fontSize: '14px',
              color: currentStep >= step ? colors.neutral[800] : colors.neutral[500],
              fontWeight: currentStep === step ? '600' : '400',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              {step === 1 ? 'Company Info' : step === 2 ? 'Account Setup' : 'Documents'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => {
    return (
      <>
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.neutral[700]
          }}>
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter your company name"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${errors.companyName ? colors.error.main : colors.neutral[300]}`,
              fontSize: '16px',
              backgroundColor: colors.neutral[50],
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
          {errors.companyName && (
            <div style={{
              color: colors.error.main,
              fontSize: '14px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.companyName}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.neutral[700]
          }}>
            Industry
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${errors.industry ? colors.error.main : colors.neutral[300]}`,
              fontSize: '16px',
              backgroundColor: colors.neutral[50],
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxSizing: 'border-box',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(colors.neutral[500])}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              backgroundSize: '16px'
            }}
          >
            <option value="">Select your industry</option>
            {industryOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.industry && (
            <div style={{
              color: colors.error.main,
              fontSize: '14px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.industry}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.neutral[700]
          }}>
            Company Size
          </label>
          <select
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${errors.companySize ? colors.error.main : colors.neutral[300]}`,
              fontSize: '16px',
              backgroundColor: colors.neutral[50],
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxSizing: 'border-box',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(colors.neutral[500])}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              backgroundSize: '16px'
            }}
          >
            <option value="">Select company size</option>
            <option value="small">Small (≤50 employees)</option>
            <option value="medium">Medium (51–100 employees)</option>
            <option value="large">Large (101–500 employees)</option>
            <option value="corporate">Corporate (500+ employees)</option>
          </select>
          {errors.companySize && (
            <div style={{
              color: colors.error.main,
              fontSize: '14px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.companySize}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderStep2 = () => {
    return (
      <>
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.neutral[700]
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="company@example.com"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${errors.companyEmail ? colors.error.main : colors.neutral[300]}`,
              fontSize: '16px',
              backgroundColor: colors.neutral[50],
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
          {errors.companyEmail && (
            <div style={{
              color: colors.error.main,
              fontSize: '14px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.companyEmail}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.neutral[700]
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a secure password"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${errors.password ? colors.error.main : colors.neutral[300]}`,
              fontSize: '16px',
              backgroundColor: colors.neutral[50],
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
          {errors.password && (
            <div style={{
              color: colors.error.main,
              fontSize: '14px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.password}
            </div>
          )}
          {password && !errors.password && (
            <div style={{
              fontSize: '14px',
              marginTop: '6px',
              color: colors.neutral[600]
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
                color: password.length >= 8 ? colors.success.main : colors.neutral[500]
              }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {password.length >= 8 ? (
                    <path d="M20 6L9 17l-5-5" />
                  ) : (
                    <circle cx="12" cy="12" r="10" />
                  )}
                </svg>
                At least 8 characters
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.neutral[700]
          }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: `1px solid ${errors.confirmPassword ? colors.error.main : colors.neutral[300]}`,
              fontSize: '16px',
              backgroundColor: colors.neutral[50],
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
          {errors.confirmPassword && (
            <div style={{
              color: colors.error.main,
              fontSize: '14px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.confirmPassword}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderStep3 = () => {
    return (
      <>
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.neutral[700]
          }}>
            Company Logo
          </label>
          <div
            onDragOver={(e) => handleDragOver(e, 'logo')}
            onDragLeave={(e) => handleDragLeave(e, 'logo')}
            onDrop={(e) => handleDrop(e, 'logo')}
            style={{
              border: `2px dashed ${isDraggingLogo ? colors.primary.main : errors.companyLogo ? colors.error.main : colors.neutral[300]}`,
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: isDraggingLogo ? colors.primary.lighter : colors.neutral[50],
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('logo-upload').click()}
          >
            {logoPreview ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <img
                  src={logoPreview || "/placeholder.svg"}
                  alt="Logo Preview"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <div style={{
                  fontSize: '14px',
                  color: colors.neutral[600],
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  Click or drag to replace
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary.lighter,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.primary.main}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: colors.neutral[800]
                }}>
                  Upload Company Logo
                </div>
                <div style={{
                  fontSize: '14px',
                  color: colors.neutral[600]
                }}>
                  Drag and drop or click to browse
                </div>
                <div style={{
                  fontSize: '12px',
                  color: colors.neutral[500]
                }}>
                  Recommended: Square image, at least 200x200px (Max 2MB)
                </div>
              </div>
            )}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
          </div>
          {errors.companyLogo && (
            <div style={{
              color: colors.error.main,
              fontSize: '14px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.companyLogo}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.neutral[700]
          }}>
            Business Document
          </label>
          <div
            onDragOver={(e) => handleDragOver(e, 'doc')}
            onDragLeave={(e) => handleDragLeave(e, 'doc')}
            onDrop={(e) => handleDrop(e, 'doc')}
            style={{
              border: `2px dashed ${isDraggingDoc ? colors.primary.main : errors.document ? colors.error.main : colors.neutral[300]}`,
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: isDraggingDoc ? colors.primary.lighter : colors.neutral[50],
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('document-upload').click()}
          >
            {documentFile ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: colors.neutral[100],
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: colors.primary.lighter,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.primary.main}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: colors.neutral[800],
                    marginBottom: '4px',
                    wordBreak: 'break-all'
                  }}>
                    {documentFile.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: colors.neutral[600]
                  }}>
                    {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocumentFile(null);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.neutral[500],
                    padding: '8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: colors.primary.lighter,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.primary.main}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: colors.neutral[800]
                }}>
                  Upload Business Document
                </div>
                <div style={{
                  fontSize: '14px',
                  color: colors.neutral[600]
                }}>
                  Drag and drop or click to browse
                </div>
                <div style={{
                  fontSize: '12px',
                  color: colors.neutral[500]
                }}>
                  Accepted formats: PDF, DOCX, TXT (Max 5MB)
                </div>
              </div>
            )}
            <input
              id="document-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleDocumentChange}
              style={{ display: 'none' }}
            />
          </div>
          {errors.document && (
            <div style={{
              color: colors.error.main,
              fontSize: '14px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errors.document}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: colors.neutral[50],
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '32px',
          borderBottom: `1px solid ${colors.neutral[200]}`,
          backgroundColor: colors.primary.lighter,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '150px',
            height: '150px',
            background: `radial-gradient(circle at top right, ${colors.primary.light}, transparent 70%)`,
            opacity: 0.6,
            zIndex: 0
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: colors.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '700',
                  color: colors.neutral[900]
                }}>
                  Company Registration
                </h1>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '16px',
                  color: colors.neutral[600]
                }}>
                  Create your company account to get started
                </p>
              </div>
            </div>
            
            {renderStepIndicator()}
          </div>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ padding: '32px' }}>
            {renderStepContent()}

            {errors.general && (
              <div style={{
                backgroundColor: colors.error.light,
                color: colors.error.dark,
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.general}
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: currentStep === 1 ? 'flex-end' : 'space-between',
              marginTop: '32px'
            }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: colors.neutral[700],
                    border: `1px solid ${colors.neutral[300]}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Back
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: colors.primary.main,
                    color: colors.primary.contrast,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Continue
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: isLoading ? colors.neutral[400] : colors.primary.main,
                    color: colors.primary.contrast,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ animation: 'spin 1s linear infinite' }}
                      >
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        <div style={{
          padding: '16px 32px',
          borderTop: `1px solid ${colors.neutral[200]}`,
          textAlign: 'center',
          fontSize: '14px',
          color: colors.neutral[600]
        }}>
          Already have an account?{' '}
          <a
            href="/"
            style={{
              color: colors.primary.main,
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Sign in
          </a>
        </div>
      </div>

      {/* Success Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            animation: 'slideUp 0.4s ease-out'
          }}>
            <div style={{
              backgroundColor: colors.success.light,
              padding: '32px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.success.main}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: colors.success.dark
              }}>
                Registration Successful!
              </h2>
              <p style={{
                margin: '0',
                fontSize: '16px',
                color: colors.neutral[700]
              }}>
                Your company registration has been submitted.
              </p>
            </div>
            
            <div style={{ padding: '24px 32px' }}>
              <div style={{
                backgroundColor: colors.neutral[100],
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.warning.main}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.neutral[800]
                  }}>
                    Pending Approval
                  </span>
                </div>
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  color: colors.neutral[700],
                  lineHeight: '1.5'
                }}>
                  Your registration is pending approval from the SCAD administrator. You'll receive a notification once your account is approved.
                </p>
              </div>
              
              <button
                onClick={handleModalOkClick}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: colors.primary.main,
                  color: colors.primary.contrast,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}

export default CompanyRegister;