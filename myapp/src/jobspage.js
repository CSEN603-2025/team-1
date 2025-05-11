import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedInternships, setAppliedInternships] = useState(() => {
    const storedApplied = localStorage.getItem('appliedInternships');
    return storedApplied ? JSON.parse(storedApplied) : [];
  });
  const savedProfile = JSON.parse(localStorage.getItem('studentProfile'));
  const [extraDocuments, setExtraDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const allJobsString = localStorage.getItem('allJobs');

    if (allJobsString) {
      setJobs(JSON.parse(allJobsString));
    } else {
      setJobs([]);
    }
  }, []);

  useEffect(() => {
    let results = jobs;

    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerSearchTerm) ||
          job.companyName.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Industry filter
    if (industryFilter) {
      results = results.filter(
        (job) => job.industry && job.industry.toLowerCase() === industryFilter.toLowerCase()
      );
    }

    // Duration filter
    if (durationFilter) {
      results = results.filter(
        (job) => job.duration && job.duration.toLowerCase().includes(durationFilter.toLowerCase())
      );
    }

    // Paid filter
    if (paidFilter === 'paid') {
      results = results.filter((job) => job.isPaid);
    } else if (paidFilter === 'unpaid') {
      results = results.filter((job) => !job.isPaid);
    }

    setFilteredJobs(results);
  }, [jobs, searchTerm, industryFilter, durationFilter, paidFilter]);

  useEffect(() => {
    localStorage.setItem('appliedInternships', JSON.stringify(appliedInternships));
  }, [appliedInternships]);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  const handleDocumentChange = (event) => {
    const files = Array.from(event.target.files);
    setExtraDocuments(files);
  };

const handleApply = () => {
  if (selectedJob && selectedJob.companyEmail && savedProfile) {
    const alreadyApplied = appliedInternships.some(
      (applied) => applied.title === selectedJob.title && applied.companyName === selectedJob.companyName
    );
    if (!alreadyApplied) {
      const newApplication = {
        ...selectedJob,
        status: 'pending',
        documents: extraDocuments.map(file => file.name),
        studentProfile: savedProfile, // Include the saved profile here (in appliedInternships)
      };
      setAppliedInternships([...appliedInternships, newApplication]);
      alert(`Applied to ${selectedJob.title} at ${selectedJob.companyName}! Status: Pending. Documents uploaded: ${extraDocuments.map(file => file.name).join(', ')}`);
      setSelectedJob(null);
      setExtraDocuments([]);

      // --- Update the global jobs list ---
      const updatedAllJobs = jobs.map(job => {
        if (job.title === selectedJob.title && job.companyName === selectedJob.companyName) {
          return { ...job, applicants: [...(job.applicants || []), savedProfile] };
        }
        return job;
      });
      localStorage.setItem('allJobs', JSON.stringify(updatedAllJobs));
      setJobs(updatedAllJobs); // Update local state
      // --- Update the company-specific jobs list ---
      // 1. Construct the localStorage key for the company's jobs
      const companyJobsKey = `companyJobs_${selectedJob.companyEmail}`;

      // 2. Retrieve the company's jobs from localStorage
      const companyJobsString = localStorage.getItem(companyJobsKey);
      if (companyJobsString) {
        const companyJobs = JSON.parse(companyJobsString);

        // 3. Update the applicants array for the specific job
        const updatedCompanyJobs = companyJobs.map(job => {
          if (job.title === selectedJob.title) { // Match based on a unique identifier if possible (e.g., job.id)
            return { ...job, applicants: [...(job.applicants || []), savedProfile] };
          }
          return job;
        });

        // 4. Save the updated company jobs back to localStorage
        localStorage.setItem(companyJobsKey, JSON.stringify(updatedCompanyJobs));

        // --- Optionally, you might want to update the local state of postedJobs in CompanyPage ---
        // This is tricky as Jobs doesn't have direct access to CompanyPage's state.
        // A more robust solution would involve a global state management system.
      } else {
        console.warn(`Company jobs not found in localStorage for key: ${companyJobsKey}`);
      }
      // --- End of company-specific update ---

    } else {
      alert('You have already applied to this internship.');
    }
  } else if (!selectedJob) {
    alert('Please select an internship to apply.');
  } else if (!selectedJob.companyEmail) {
    console.error('Error: selectedJob is missing companyEmail', selectedJob);
    alert('Error applying: Internship details missing company information.');
  } else if (!savedProfile) {
    alert('Student profile not found. Please ensure your profile is saved.');
  }
};
  const handleGoToMyApplications = () => {
    navigate('/studentapplications');
  };

  const handleBack = () => {
    navigate('/studentpage');
  };

  const isAlreadyApplied = (job) => {
    return appliedInternships.some(applied => applied.title === job.title && applied.companyName === job.companyName);
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '30px auto',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333',
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#007bff' }}>Available Internships</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Job Title or Company"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flexGrow: 1, minWidth: '200px' }}
        />

        {/* Industry Filter */}
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          <option value="">All Industries</option>
          {Array.from(new Set(jobs.map(job => job.industry).filter(Boolean))).map((industry) => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>

        {/* Duration Filter */}
        <select
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          <option value="">Any Duration</option>
          <option value="1 month">1 Month</option>
          <option value="2 months">2 Months</option>
          <option value="3 months">3 Months</option>
          {/* Add more duration options as needed */}
        </select>

        {/* Paid/Unpaid Filter */}
        <select
          value={paidFilter}
          onChange={(e) => setPaidFilter(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          <option value="">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <button onClick={handleGoToMyApplications} style={{
          padding: '10px 15px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
        }}>
          View My Applications
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <h2>Available Internships</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden',
          minWidth: '350px',
        }}>
          <thead style={{ backgroundColor: '#007bff', color: 'white' }}>
            <tr>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Company</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Duration</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Paid</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px 15px' }}>{job.companyName}</td>
                <td style={{ padding: '12px 15px' }}>{job.title}</td>
                <td style={{ padding: '12px 15px' }}>{job.duration}</td>
                <td style={{ padding: '12px 15px' }}>{job.isPaid ? 'Yes' : 'No'}</td>
                <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleSelectJob(job)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginRight: '5px',
                    }}
                  >
                    Select
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={isAlreadyApplied(job)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isAlreadyApplied(job) ? '#ccc' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {isAlreadyApplied(job) ? 'Applied' : 'Apply'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '12px 15px', textAlign: 'center', fontStyle: 'italic', color: '#777' }}>
                  No internships match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedJob && (
        <div style={{ marginTop: '30px', border: '1px solid #ccc', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ color: '#007bff', marginBottom: '15px' }}>Selected Internship</h2>
          <p><strong>Company:</strong> {selectedJob.companyName}</p>
          <p><strong>Title:</strong> {selectedJob.title}</p>
          <p><strong>Duration:</strong> {selectedJob.duration}</p>
          <p><strong>Paid:</strong> {selectedJob.isPaid ? 'Yes' : 'No'}</p>
          {selectedJob.industry && <p><strong>Industry:</strong> {selectedJob.industry}</p>}

          <div style={{ marginTop: '15px' }}>
            <label htmlFor="extraDocuments" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Upload Supporting Documents (CV, Cover Letter, Certificates, etc.):
            </label>
            <input
              type="file"
              id="extraDocuments"
              multiple
              onChange={handleDocumentChange}
              style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
            {extraDocuments.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#555' }}>
                <strong>Selected Files:</strong>
                <ul>
                  {extraDocuments.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleApply}
            disabled={selectedJob && isAlreadyApplied(selectedJob)}
            style={{
              marginTop: '15px',
              padding: '10px 15px',
              backgroundColor: selectedJob && isAlreadyApplied(selectedJob) ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {selectedJob && isAlreadyApplied(selectedJob) ? 'Already Applied' : 'Apply Now'}
          </button>
        </div>
      )}
      <button onClick={handleBack} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}>
        Back to Student Page
      </button>
    </div>
  );
}

export default Jobs;