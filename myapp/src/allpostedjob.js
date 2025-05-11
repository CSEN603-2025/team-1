import React, { useState, useEffect } from 'react';

function ALLJobs() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
 

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

    // Industry filter (assuming each job object has an 'industry' property)
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

        {/* Industry Filter (assuming you have an array of unique industries) */}
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
          <option value="2 months">3 Months</option>
          <option value="3 months">6 Months</option>
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
      </div>

      <div style={{ overflowX: 'auto' }}>
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

    </div>
  );
}

export default ALLJobs;
