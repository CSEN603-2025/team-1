import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, CheckSquare, BarChart2, LogOut, X, ChevronRight } from 'lucide-react';

const SidebarFac = ({ menuOpen, toggleMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState('');
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Update active route when location changes
  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  const navButtons = [
    { label: 'Homepage', path: '/facultypage', icon: <Home size={18} /> },
    { label: 'All Reports', path: '/facultyreports', icon: <FileText size={18} />, state: {type:'faculty'} },
    { label: 'All Evaluations', path: '/evaluation', icon: <CheckSquare size={18} />, state: { type: 'faculty'} },
    { label: 'Generate Statistics Report', path: '/statistics', icon: <BarChart2 size={18} />, state: { type: 'faculty'} },
  ];

  // Handle navigation with visual feedback
  const handleNavigation = (path, state) => {
    setActiveRoute(path);
    navigate(path, state ? { state } : undefined);
  };

  // Handle logout with custom confirmation
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate('/');
  };

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // CSS styles with pastel colors
  const styles = `
    .sidebar-container {
      background: linear-gradient(135deg, #b5c7f8 0%, #d5c5f7 100%);
      color: #4a4a6a;
      transition: all 0.3s ease;
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
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
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

    .tooltip {
      position: absolute;
      background-color: #a5b7e8;
      color: #4a4a6a;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      transform: translateY(5px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
      z-index: 100;
      left: 100%;
      top: 50%;
      margin-left: 10px;
      transform: translateY(-50%);
    }

    .tooltip.visible {
      opacity: 1;
      transform: translateY(-50%);
    }

    .tooltip::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 5px 5px 5px 0;
      border-style: solid;
      border-color: transparent #a5b7e8 transparent transparent;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .nav-item {
      animation: fadeIn 0.3s forwards;
      animation-delay: calc(0.05s * var(--index));
      opacity: 0;
    }

    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      padding: 10px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(74, 74, 106, 0.2);
      color: #4a4a6a;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      font-weight: bold;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: bold;
      font-size: 14px;
      color: #4a4a6a;
    }

    .user-role {
      font-size: 12px;
      opacity: 0.8;
      color: #6a6a8a;
    }

    /* Hide scrollbar but keep functionality */
    .sidebar-content::-webkit-scrollbar {
      width: 0;
      background: transparent;
    }

    .sidebar-content {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }

    .sidebar-footer {
      padding-top: 10px;
      border-top: 1px solid rgba(74, 74, 106, 0.1);
      background: linear-gradient(135deg, #b5c7f8 0%, #d5c5f7 100%);
    }

    /* Custom Logout Confirmation Dialog */
    .logout-confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s forwards;
    }

    .logout-confirm-dialog {
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 320px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
    }

    .logout-confirm-title {
      font-size: 18px;
      font-weight: bold;
      color: #4a4a6a;
      margin-bottom: 12px;
    }

    .logout-confirm-message {
      font-size: 14px;
      color: #6a6a8a;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .logout-confirm-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .logout-confirm-cancel {
      padding: 8px 16px;
      background-color: #f1f1f1;
      color: #6a6a8a;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .logout-confirm-cancel:hover {
      background-color: #e5e5e5;
    }

    .logout-confirm-ok {
      padding: 8px 16px;
      background-color: rgba(255, 200, 200, 0.5);
      color: #9a4a4a;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .logout-confirm-ok:hover {
      background-color: rgba(255, 200, 200, 0.7);
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
          overflowX: 'hidden',
          transition: 'width 0.3s ease, box-shadow 0.3s ease',
          boxShadow: menuOpen ? '2px 0 15px rgba(0,0,0,0.1)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10,
        }}
        aria-hidden={!menuOpen}
        role="navigation"
        aria-label="Faculty Navigation"
      >
        {menuOpen && (
          <>
            {/* Main content area with hidden scrollbar */}
            <div 
              className="sidebar-content"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 20px 10px 20px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0, // Important for proper flex behavior
              }}
            >
              {/* Header with title and close button */}
              <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="sidebar-title">Faculty Portal</h2>
                <button
                  onClick={toggleMenu}
                  className="close-button"
                  aria-label="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* User info section */}
              <div className="user-info">
                <div className="user-avatar">FP</div>
                <div className="user-details">
                  <div className="user-name">Faculty User</div>
                  <div className="user-role">Mariam</div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div style={{ marginTop: '20px' }}>
                {navButtons.map(({ label, path, icon, state }, index) => (
                  <div 
                    key={path} 
                    className="nav-item" 
                    style={{ '--index': index }}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <button
                      onClick={() => handleNavigation(path, state)}
                      className={`sidebar-btn ${activeRoute === path ? 'active' : ''}`}
                      aria-current={activeRoute === path ? 'page' : undefined}
                    >
                      <div className="btn-content">
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="btn-icon">{icon}</span>
                          {label}
                        </span>
                        {activeRoute === path && <ChevronRight size={16} />}
                      </div>
                    </button>
                    <div className={`tooltip ${hoverIndex === index ? 'visible' : ''}`}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout Button - fixed at bottom */}
            <div className="sidebar-footer" style={{ padding: '10px 20px 20px 20px' }}>
              <button
                onClick={handleLogout}
                className="sidebar-btn logout-btn"
                aria-label="Logout from faculty portal"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <LogOut size={18} />
                  Logout
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Custom Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-dialog">
            <div className="logout-confirm-title">Sign Out</div>
            <div className="logout-confirm-message">
              Are you sure you want to sign out of your account? You will need to log in again to access your faculty portal.
            </div>
            <div className="logout-confirm-buttons">
              <button 
                className="logout-confirm-cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button 
                className="logout-confirm-ok"
                onClick={confirmLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarFac;