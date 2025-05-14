import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarFac from './sidebarfaculty'; // Import the SidebarFac component

const FacultyPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);  // State to control the sidebar visibility
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [stats] = useState({
    pendingEvaluations: 5,
    upcomingClasses: 3,
    recentReports: 2,
    statisticsReports: 4
  });

  // Simulate loading data on component mount
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showNotification('Welcome to Faculty Portal', 'info');
    }, 800);
  }, []);

  const handleLogout = () => {
    setConfirmLogout(true);
  };

  const confirmLogoutAction = (confirm) => {
    setConfirmLogout(false);
    if (confirm) {
      setLoading(true);
      showNotification('Logging out...', 'info');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);  // Toggle sidebar visibility
  };

  const navigateTo = (section, state = null) => {
    if (state) {
      navigate(`/${section}`, { state });
    } else {
      setActiveSection(section);
      showNotification(`Navigated to ${section}`, 'success');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Dashboard cards data
  const dashboardCards = [
    { 
      title: 'Pending Evaluations', 
      count: stats.pendingEvaluations, 
      icon: '📝', 
      color: '#d5c5f7',
      action: () => navigateTo('evaluation', { type: 'faculty' })
    },
    { 
      title: 'Students Reports', 
      count: stats.recentReports, 
      icon: '📊', 
      color: '#c5e8f7',
      action: () => navigateTo('facultyreports', { type: 'faculty' })
    },
    { 
      title: 'Statistics Report', 
      count: stats.statisticsReports, 
      icon: '📈', 
      color: '#f7d5c5',
      action: () => navigateTo('statistics', { type: 'faculty' })
    }
  ];

  // Recent activities data
  const recentActivities = [
    { id: 1, activity: 'Submitted evaluation for CS101', date: 'Today, 10:30 AM', status: 'Completed' },
    { id: 2, activity: 'Updated course materials for CS202', date: 'Yesterday, 2:15 PM', status: 'Completed' },
    { id: 3, activity: 'Pending report for department meeting', date: 'May 15, 2023', status: 'Pending' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <SidebarFac menuOpen={menuOpen} toggleMenu={toggleMenu} />

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        position: 'relative'
      }}>
        {/* Top Navigation Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '15px 20px',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          zIndex: 5
        }}>
          {/* Hamburger Icon */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
              backgroundColor: menuOpen ? 'rgba(181, 199, 248, 0.2)' : 'transparent'
            }}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleMenu()}
          >
            <div style={{ width: '25px', height: '3px', backgroundColor: '#4a4a6a', margin: '2px 0', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></div>
            <div style={{ width: '25px', height: '3px', backgroundColor: '#4a4a6a', margin: '2px 0', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }}></div>
            <div style={{ width: '25px', height: '3px', backgroundColor: '#4a4a6a', margin: '2px 0', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></div>
          </div>

          <h1 style={{ 
            margin: '0 0 0 20px', 
            fontSize: '20px', 
            color: '#4a4a6a',
            fontWeight: 'bold'
          }}>
            Faculty Portal
          </h1>

          {/* Navigation Breadcrumbs */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginLeft: '20px'
          }}>
            <span style={{ color: '#6a6a8a', fontSize: '14px' }}>Home</span>
            {activeSection !== 'dashboard' && (
              <>
                <span style={{ margin: '0 8px', color: '#6a6a8a' }}>/</span>
                <span style={{ color: '#4a4a6a', fontSize: '14px', fontWeight: 'bold' }}>
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                </span>
              </>
            )}
          </div>

          {/* User Profile */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              backgroundColor: '#d5c5f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4a4a6a',
              fontWeight: 'bold',
              fontSize: '16px',
              marginRight: '10px'
            }}>
              FP
            </div>
            <div style={{ marginRight: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a4a6a' }}>Faculty User</div>
              <div style={{ fontSize: '12px', color: '#6a6a8a' }}>Mariam</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 200, 200, 0.5)',
                color: '#9a4a4a',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 200, 200, 0.7)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 200, 200, 0.5)'}
              disabled={loading}
              aria-label="Logout"
            >
              {loading ? 'Please wait...' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ 
          flex: 1, 
          padding: '20px',
          overflowY: 'auto'
        }}>
          {/* Loading Indicator */}
          {loading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                margin: '0 auto 10px',
                border: '4px solid rgba(181, 199, 248, 0.3)',
                borderRadius: '50%',
                borderTop: '4px solid #b5c7f8',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ color: '#4a4a6a' }}>Loading...</div>
            </div>
          )}

          {!loading && (
            <>
              {/* Welcome Section */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  margin: '0 0 10px 0', 
                  color: '#4a4a6a',
                  fontSize: '22px'
                }}>
                  Welcome to Faculty Portal
                </h2>
                <p style={{ 
                  margin: '0',
                  color: '#6a6a8a',
                  lineHeight: '1.5'
                }}>
                  This is your dashboard where you can manage evaluations, view reports, and access all faculty resources.
                </p>
              </div>

              {/* Dashboard Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', // Bigger card width
                gap: '30px',
                marginBottom: '30px',
                maxWidth: '1200px',
                width: '100%',
                
              }}>
                {dashboardCards.map((card, index) => (
                  <div 
                    key={index}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '30px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onClick={card.action}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && card.action()}
                    aria-label={`View ${card.title}`}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      width: '100px',
                      height: '100px',
                      borderRadius: '0 0 0 100px',
                      backgroundColor: card.color,
                      opacity: '0.2'
                    }}></div>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '10px'
                    }}>
                      {card.icon}
                    </div>
                    <div style={{
                      fontSize: '38px',
                      fontWeight: 'bold',
                      color: '#4a4a6a',
                      marginBottom: '5px'
                    }}>
                      {card.count}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#6a6a8a'
                    }}>
                      {card.title}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activities */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h2 style={{ 
                  margin: '0 0 20px 0', 
                  color: '#4a4a6a',
                  fontSize: '18px'
                }}>
                  Recent Activities
                </h2>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr>
                        <th style={{ 
                          textAlign: 'left', 
                          padding: '12px 15px', 
                          borderBottom: '1px solid #eee',
                          color: '#4a4a6a'
                        }}>Activity</th>
                        <th style={{ 
                          textAlign: 'left', 
                          padding: '12px 15px', 
                          borderBottom: '1px solid #eee',
                          color: '#4a4a6a'
                        }}>Date</th>
                        <th style={{ 
                          textAlign: 'left', 
                          padding: '12px 15px', 
                          borderBottom: '1px solid #eee',
                          color: '#4a4a6a'
                        }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities.map(activity => (
                        <tr key={activity.id}>
                          <td style={{ 
                            padding: '12px 15px', 
                            borderBottom: '1px solid #eee',
                            color: '#6a6a8a'
                          }}>{activity.activity}</td>
                          <td style={{ 
                            padding: '12px 15px', 
                            borderBottom: '1px solid #eee',
                            color: '#6a6a8a'
                          }}>{activity.date}</td>
                          <td style={{ 
                            padding: '12px 15px', 
                            borderBottom: '1px solid #eee'
                          }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: activity.status === 'Completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                              color: activity.status === 'Completed' ? '#4CAF50' : '#FF9800'
                            }}>
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: notification.type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 
                          notification.type === 'error' ? 'rgba(244, 67, 54, 0.9)' : 
                          'rgba(33, 150, 243, 0.9)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '300px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {confirmLogout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            width: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#4a4a6a',
              fontSize: '18px'
            }}>
              Confirm Logout
            </h3>
            <p style={{ 
              margin: '0 0 20px 0',
              color: '#6a6a8a'
            }}>
              Are you sure you want to log out?
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={() => confirmLogoutAction(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f1f1f1',
                  color: '#6a6a8a',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmLogoutAction(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 200, 200, 0.5)',
                  color: '#9a4a4a',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default FacultyPage;