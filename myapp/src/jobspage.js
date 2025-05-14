import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setNotification } from './notification'; 

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
  const [extraDocuments, setExtraDocuments] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const studentj = location.state?.student; 

  const [showInternshipInfoModal, setShowInternshipInfoModal] = useState(false);

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
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerSearchTerm) ||
          job.companyName.toLowerCase().includes(lowerSearchTerm)
      );
    }
    if (industryFilter) {
      results = results.filter(
        (job) => job.industry && job.industry.toLowerCase() === industryFilter.toLowerCase()
      );
    }
    if (durationFilter) {
      results = results.filter(
        (job) => job.duration && job.duration.toLowerCase().includes(durationFilter.toLowerCase())
      );
    }
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
    if (selectedJob && selectedJob.companyEmail && studentj) {
      const alreadyApplied = appliedInternships.some(
        (applied) => applied.title === selectedJob.title && applied.companyName === selectedJob.companyName
      );
      if (!alreadyApplied) {
        const message = `${studentj.email} has applied to ${selectedJob.title}.`;
        setNotification(message, selectedJob.companyEmail);
        const newApplication = {
          ...selectedJob,
          status: 'pending',
          documents: extraDocuments.map(file => file.name),
          studentProfile: studentj, 
        };
        setAppliedInternships([...appliedInternships, newApplication]);
        alert(`Applied to ${selectedJob.title} at ${selectedJob.companyName}! Status: Pending. Documents uploaded: ${extraDocuments.map(file => file.name).join(', ')}`);
        setSelectedJob(null);
        setExtraDocuments([]);

        const updatedAllJobs = jobs.map(job => {
          if (job.title === selectedJob.title && job.companyName === selectedJob.companyName) {
            return { ...job, applicants: [...(job.applicants || []), studentj] };
          }
          return job;
        });
        localStorage.setItem('allJobs', JSON.stringify(updatedAllJobs));
        setJobs(updatedAllJobs);
        
        const companyJobsKey = `companyJobs_${selectedJob.companyEmail}`;
        const companyJobsString = localStorage.getItem(companyJobsKey);
        if (companyJobsString) {
          const companyJobs = JSON.parse(companyJobsString);
          const updatedCompanyJobs = companyJobs.map(job => {
            if (job.title === selectedJob.title) {
              return { ...job, applicants: [...(job.applicants || []), studentj] };
            }
            return job;
          });
          localStorage.setItem(companyJobsKey, JSON.stringify(updatedCompanyJobs));
        } else {
          console.warn(`Company jobs not found in localStorage for key: ${companyJobsKey}`);
        }
      } else {
        alert('You have already applied to this internship.');
      }
    } else if (!selectedJob) {
      alert('Please select an internship to apply.');
    } else if (!selectedJob.companyEmail) {
      alert('Error applying: Internship details missing company information.');
    } else if (!studentj) {
      alert('Student information not found. Please log in again.');
    }
  };

  const handleGoToMyApplications = () => {
    navigate('/studentapplications', { state: { studentj } });
  };

  const handleBack = () => {
    navigate('/studentpage', { state: { studentj } });
  };

  const isAlreadyApplied = (job) => {
    return appliedInternships.some(applied => applied.title === job.title && applied.companyName === job.companyName);
  };

  const getInternshipVideoInfo = () => {
    const defaultVideo = {
        title: "General Internship Guidance Video",
        embedHtml:`<iframe width="560" height="315" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`, 
        // Example: Non-Rickroll generic advice video
        description: "This video provides general tips for finding and succeeding in internships. For specific requirements related to your major, please consult your academic advisor."
    };

    if (studentj && studentj.major) {
      switch (studentj.major.toLowerCase()) {
        case 'computer science':
          return {
            title: "Internship Insights for Computer Science Majors",
            embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`, 
            description: "Learn about typical internships for CS students and how to make the most of them."
          };
        case 'electrical engineering':
          return {
            title: "Electrical Engineering Internship Opportunities",
            embedHtml: `<iframe width="560" height="" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`, 
            // Note: The video ID "_Kv2yUnv2E" seemed to have a space in your example, corrected it.
            description: "Explore internships in the field of Electrical Engineering."
          };
        case 'business administration':
            return {
                title: "Business Administration Internship Pathways",
                embedHtml: `<iframe width="560" height="315" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`, 
                description: "Discover various internship roles for Business Administration students."
            };
        default:
          return {
            title: `Internship Guidance for ${studentj.major} Majors`,
            embedHtml:`<iframe width="560" height="500" src="https://www.youtube.com/embed/VSkvwzqo-Pk?si=ngv6R1pNMKALFV_-" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`, 
            description: `This video offers general internship advice. Specific guidance for ${studentj.major} should be sought from your department.`
          };
      }
    }
    return defaultVideo;
  };


  return (
    <div style={styles.pageContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#007bff', margin: 0 }}>Available Internships</h1>
        <button 
            onClick={() => setShowInternshipInfoModal(true)} 
            title="Internship Requirement Info"
            style={styles.infoIconButton}
        >
            ▶️
        </button>
      </div>

      <div style={styles.filtersContainer}>
        <input
          type="text"
          placeholder="Search by Job Title or Company"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.filterInput}
        />
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Industries</option>
          {Array.from(new Set(jobs.map(job => job.industry).filter(Boolean))).map((industry) => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
        <select
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">Any Duration</option>
          <option value="1 month">1 Month</option>
          <option value="2 months">2 Months</option>
          <option value="3 months">3 Months</option>
        </select>
        <select
          value={paidFilter}
          onChange={(e) => setPaidFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All (Paid/Unpaid)</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <button onClick={handleGoToMyApplications} style={styles.actionButton}>
          View My Applications
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <h2 style={{marginTop: '30px'}}>Internship Listings</h2>
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th style={styles.tableHeader}>Company</th>
              <th style={styles.tableHeader}>Title</th>
              <th style={styles.tableHeader}>Duration</th>
              <th style={styles.tableHeader}>Paid</th>
              <th style={styles.tableHeaderAction}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job, index) => (
              <tr key={job.id || `${job.title}-${job.companyName}-${index}`} style={styles.tableRow}>
                <td style={styles.tableCell}>{job.companyName}</td>
                <td style={styles.tableCell}>{job.title}</td>
                <td style={styles.tableCell}>{job.duration}</td>
                <td style={styles.tableCell}>{job.isPaid ? 'Yes' : 'No'}</td>
                <td style={styles.tableCellAction}>
                  <button
                    onClick={() => handleSelectJob(job)}
                    style={styles.selectButton}
                  >
                    View & Apply
                  </button>
                </td>
              </tr>
            ))}
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan="5" style={styles.noResultsCell}>
                  No internships match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedJob && (
        <div style={styles.selectedJobContainer}>
          <h2 style={{ color: '#007bff', marginBottom: '15px' }}>Apply for: {selectedJob.title}</h2>
          <p><strong>Company:</strong> {selectedJob.companyName}</p>
          <p><strong>Duration:</strong> {selectedJob.duration}</p>
          <p><strong>Paid:</strong> {selectedJob.isPaid ? 'Yes' : 'No'}</p>
          {selectedJob.industry && <p><strong>Industry:</strong> {selectedJob.industry}</p>}
          {selectedJob.description && <p style={{marginTop: '10px', lineHeight: '1.6'}}><strong>Description:</strong> {selectedJob.description}</p>}

          <div style={{ marginTop: '15px' }}>
            <label htmlFor="extraDocuments" style={styles.fileInputLabel}>
              Upload Supporting Documents (CV, Cover Letter, etc.):
            </label>
            <input
              type="file"
              id="extraDocuments"
              multiple
              onChange={handleDocumentChange}
              style={styles.fileInput}
            />
            {extraDocuments.length > 0 && (
              <div style={styles.selectedFilesContainer}>
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
            disabled={isAlreadyApplied(selectedJob)}
            style={isAlreadyApplied(selectedJob) ? styles.applyButtonDisabled : styles.applyButton}
          >
            {isAlreadyApplied(selectedJob) ? 'Already Applied' : 'Apply Now'}
          </button>
           <button 
                onClick={() => setSelectedJob(null)} 
                style={{...styles.actionButton, backgroundColor: '#6c757d', marginTop: '20px', marginLeft: '10px'}}
            >
                Close Details
            </button>
        </div>
      )}

      {showInternshipInfoModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#007bff', marginTop: 0, marginBottom: '10px' }}>
              {getInternshipVideoInfo().title}
            </h3>
            
            <div style={styles.videoPlayerWrapper}>
              {getInternshipVideoInfo().embedHtml && (
                <div dangerouslySetInnerHTML={{ __html: getInternshipVideoInfo().embedHtml }} />
              )}
            </div>

            <p style={{lineHeight: '1.6', marginTop: '15px', fontSize: '0.95em'}}>
                {getInternshipVideoInfo().description}
            </p>
            <p style={{lineHeight: '1.6', fontSize: '0.85em', color: '#555', marginTop: '10px'}}>
                Please consult your academic advisor or department's internship coordinator for official requirements and approval processes.
            </p>
            <button 
                onClick={() => setShowInternshipInfoModal(false)} 
                style={{...styles.actionButton, backgroundColor: '#6c757d', marginTop: '20px', float: 'right'}}
            >
                Close
            </button>
          </div>
        </div>
      )}

      <button onClick={handleBack} style={{...styles.actionButton, marginTop: '30px' }}>
        Back to Student Page
      </button>
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: '900px',
    margin: '30px auto',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
  },
  infoIconButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.8em', 
    cursor: 'pointer',
    color: '#007bff',
    padding: '0 5px',
  },
  filtersContainer: {
    marginBottom: '20px',
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  filterInput: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    flexGrow: 1,
    minWidth: '200px',
  },
  filterSelect: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: 'white',
  },
  actionButton: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden', 
    minWidth: '600px', 
  },
  tableHead: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  tableHeader: {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd', 
  },
  tableHeaderAction: {
    padding: '12px 15px',
    textAlign: 'center',
    borderBottom: '1px solid #ddd',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    padding: '12px 15px',
  },
  tableCellAction: {
    padding: '12px 15px',
    textAlign: 'center',
  },
  selectButton: { // Renamed from actionButton for clarity in table
    padding: '8px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  noResultsCell: {
    padding: '12px 15px',
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#777',
  },
  selectedJobContainer: {
    marginTop: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fdfdfd',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  fileInputLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  fileInput: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    width: 'calc(100% - 18px)', 
  },
  selectedFilesContainer: {
    marginTop: '10px',
    fontSize: '0.9em',
    color: '#555',
    paddingLeft: '20px', 
  },
  applyButton: {
    marginTop: '20px',
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s ease',
  },
  applyButtonDisabled: {
    marginTop: '20px',
    padding: '12px 20px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
    fontSize: '16px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1200, 
  },
  modalContent: { 
    backgroundColor: '#fff',
    padding: '20px', 
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px', 
    maxHeight: '90vh', 
    overflowY: 'auto', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  videoPlayerWrapper: { // Style for the video iframe container
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    paddingTop: '56.25%', /* 16:9 Aspect Ratio */
    backgroundColor: '#eee', // Placeholder background
    borderRadius: '4px',
    marginBottom: '10px',
    '& iframe': { // This pseudo-selector won't work in inline styles directly
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
        border: 'none',
    }
  },
};

export default Jobs;