import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Building, Users, FileText, CheckSquare, BarChart2, Briefcase, BookOpen, Calendar, LogOut, X, ChevronRight } from 'lucide-react';

const Sidebar = ({ menuOpen, toggleMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState('');

  // Update active route when location changes
  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  const navButtons = [
    { label: 'Homepage', path: '/scadpage', icon: <Home size={18} /> },
    { label: 'Company Registrations', path: '/view-registration', icon: <Building size={18} /> },
    { label: 'View All Students', path: '/allstudents', icon: <Users size={18} /> },
    { label: 'All Reports', path: '/facultyreports', icon: <FileText size={18} />, state: {type:'scad'} },
    { label: 'All Evaluations', path: '/evaluation', icon: <CheckSquare size={18} />, state:{ type: 'scad'} },
    { label: 'Generate Statistics Report', path: '/statistics', icon: <BarChart2 size={18} />, state:{ type: 'scad'} },
    { label: 'Available Internships', path: '/allpostedjobs', icon: <Briefcase size={18} /> },
    { label: 'All Workshops', path: '/workshop', icon: <BookOpen size={18} /> },
    { label: 'Upcoming Workshops', path: '/viewworkshop', icon: <Calendar size={18} /> }
  ];

  // Handle navigation with visual feedback
  const handleNavigation = (path, state) => {
    setActiveRoute(path);
    navigate(path, state ? { state } : undefined);
  };

  // CSS styles with pastel colors
  const styles = `
    .sidebar-container {
      background: linear-gradient(135deg, #b5c7f8 0%, #d5c5f7 100%);
      color: #4a4a6a;
      transition: all 0.3s ease;
      overflow-x: hidden !important; /* Force no horizontal scroll */
    }

    .sidebar-header {
      border-bottom: 1px solid rgba(74, 74, 106, 0.1);
      padding-bottom: 15px;
      margin-bottom: 15px;
    }

    .sidebar-title {
      font-size: 18px;
      font-weight: bold;
      color: #4a4a6a;
      margin: 0;
      padding: 0;
    }

    .close-button {
      background-color: rgba(74, 74, 106, 0.1);
      color: #4a4a6a;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .close-button:hover {
      background-color: rgba(74, 74, 106, 0.2);
    }

    .sidebar-btn {
      width: 100%;
      padding: 12px 15px;
      margin-bottom: 8px;
      background-color: rgba(255, 255, 255, 0.5);
      color: #4a4a6a;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
      position: relative;
      overflow: hidden;
    }

    .sidebar-btn:hover {
      background-color: rgba(255, 255, 255, 0.7);
      transform: translateX(3px);
    }

    .sidebar-btn.active {
      background-color: rgba(255, 255, 255, 0.8);
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .sidebar-btn.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background-color: #8a8aad;
      border-radius: 0 2px 2px 0;
    }

    .btn-icon {
      margin-right: 10px;
      opacity: 0.9;
      flex-shrink: 0;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .btn-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      background-color: rgba(255, 200, 200, 0.5);
      margin-top: 15px;
      font-weight: bold;
      color: #9a4a4a;
    }

    .logout-btn:hover {
      background-color: rgba(255, 200, 200, 0.7);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .nav-item {
      animation: fadeIn 0.3s forwards;
      animation-delay: calc(0.05s * var(--index));
      opacity: 0;
      width: 100%;
    }

    /* Hide scrollbar but keep functionality */
    .sidebar-content::-webkit-scrollbar {
      width: 0;
      height: 0; /* Hide horizontal scrollbar */
      background: transparent;
    }

    .sidebar-content {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
      overflow-x: hidden !important; /* Force no horizontal scroll */
    }

    .sidebar-footer {
      padding-top: 10px;
      border-top: 1px solid rgba(74, 74, 106, 0.1);
      background: linear-gradient(135deg, #b5c7f8 0%, #d5c5f7 100%);
      width: 100%;
    }
    
    /* Fix for all elements to prevent horizontal scroll */
    * {
      max-width: 100%;
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div
        className="sidebar-container"
        style={{
          width: menuOpen ? '280px' : '0',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden', /* Prevent horizontal scrolling */
          transition: 'width 0.3s ease, box-shadow 0.3s ease',
          boxShadow: menuOpen ? '2px 0 15px rgba(0,0,0,0.1)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10,
          maxWidth: '280px', /* Ensure maximum width */
        }}
        aria-hidden={!menuOpen}
        role="navigation"
        aria-label="SCAD Navigation"
      >
        {menuOpen && (
          <>
            {/* Main content area with hidden scrollbar */}
            <div 
              className="sidebar-content"
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden', /* Prevent horizontal scrolling */
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0, /* Important for proper flex behavior */
                width: '100%',
                boxSizing: 'border-box', /* Include padding in width calculation */
              }}
            >
              {/* Header with title and close button */}
              <div className="sidebar-header" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%'
              }}>
                <h2 className="sidebar-title">SCAD Portal</h2>
                <button
                  onClick={toggleMenu}
                  className="close-button"
                  aria-label="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Buttons */}
              <div style={{ marginTop: '20px', width: '100%' }}>
                {navButtons.map(({ label, path, icon, state }, index) => (
                  <div 
                    key={path} 
                    className="nav-item" 
                    style={{ '--index': index }}
                  >
                    <button
                      onClick={() => handleNavigation(path, state)}
                      className={`sidebar-btn ${activeRoute === path ? 'active' : ''}`}
                      aria-current={activeRoute === path ? 'page' : undefined}
                    >
                      <div className="btn-content">
                        <span style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1 }}>
                          <span className="btn-icon">{icon}</span>
                          <span className="btn-text">{label}</span>
                        </span>
                        {activeRoute === path && <ChevronRight size={16} style={{ flexShrink: 0 }} />}
                      </div>
                    </button>
                    {/* Tooltips removed */}
                  </div>
                ))}
              </div>
            </div>

            {/* Logout Button - fixed at bottom */}
            <div className="sidebar-footer" style={{ 
              padding: '10px 20px 20px 20px',
              boxSizing: 'border-box' /* Include padding in width calculation */
            }}>
              <button
                onClick={() => navigate('/')}
                className="sidebar-btn logout-btn"
                aria-label="Logout from SCAD portal"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Sidebar;