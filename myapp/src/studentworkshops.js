import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// --- DUMMY DATA ---
const DUMMY_WORKSHOPS = [
  {
    id: "ws101",
    title: "Resume Building Masterclass",
    date: new Date(new Date().getTime() + 1 * 60 * 1000).toISOString(), // 1 minute from now for testing
    type: "live", 
    duration: "60 minutes", 
    instructor: "Dr. Jane Doe",
    description: "Learn how to craft a compelling resume that gets noticed by recruiters. Covers formatting, content, and tailoring for specific jobs.",
    platformLink: "internal", 
    videoUrl: null, 
  },
  {
    id: "ws102",
    title: "Ace Your Job Interview",
    date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: "live",
    duration: "90 minutes",
    instructor: "Mr. John Smith",
    description: "Master common interview questions, learn STAR method, and practice your delivery. Includes mock interview session.",
    platformLink: "internal",
    videoUrl: null,
  },
  {
    id: "ws103",
    title: "Networking for Success (Pre-recorded)",
    date: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: "recorded",
    duration: "45 minutes",
    instructor: "Ms. Priya Sharma",
    description: "Discover effective strategies for building your professional network online and offline.",
    platformLink: null,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", 
  },
  {
    id: "ws104",
    title: "LinkedIn Profile Optimization",
    date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
    type: "live",
    duration: "75 minutes",
    instructor: "Mr. Alex Chen",
    description: "Turn your LinkedIn profile into a powerful career tool. Learn about optimizing sections, making connections, and content strategy.",
    platformLink: "internal", 
    videoUrl: null, 
  }
];
// --- END DUMMY DATA ---

function StudentWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [registeredWorkshopIds, setRegisteredWorkshopIds] = useState(new Set());
  const [workshopNotes, setWorkshopNotes] = useState({}); 
  const [workshopRatings, setWorkshopRatings] = useState({}); 
  const [chatMessages, setChatMessages] = useState({}); 
  const [showCertificate, setShowCertificate] = useState(null); 

  const location = useLocation();
  const navigate = useNavigate();
  const studentProfile = location.state?.student; 

  const videoRef = useRef(null); 

  const isRegistered = useCallback((workshopId) => registeredWorkshopIds.has(workshopId), [registeredWorkshopIds]);

  const loadData = useCallback(() => {
    const storedWorkshops = localStorage.getItem('studentWorkshopsAll');
    let initialWorkshops = storedWorkshops ? JSON.parse(storedWorkshops) : DUMMY_WORKSHOPS.map(ws => ({
        ...ws, 
        attendees: [], 
        chatMessages: ws.type === 'live' ? [] : undefined,
        attendedBy: [],
        workshopOverallRatings: {}, 
    }));

    const workshopMap = new Map(initialWorkshops.map(ws => [ws.id, ws]));
    DUMMY_WORKSHOPS.forEach(dummyWs => {
        const existing = workshopMap.get(dummyWs.id);
        workshopMap.set(dummyWs.id, {
            ...dummyWs, 
            attendees: existing?.attendees || [],
            chatMessages: existing?.chatMessages || (dummyWs.type === 'live' ? [] : undefined),
            attendedBy: existing?.attendedBy || [],
            workshopOverallRatings: existing?.workshopOverallRatings || {},
        });
    });
    initialWorkshops = Array.from(workshopMap.values());

    setWorkshops(initialWorkshops);
    // No need to save DUMMY_WORKSHOPS back here unless they are meant to be the single source of truth that can be updated
    // localStorage.setItem('studentWorkshopsAll', JSON.stringify(initialWorkshops)); 

    if (studentProfile?.email) {
      const storedRegistrations = localStorage.getItem(`registrations_${studentProfile.email}`);
      setRegisteredWorkshopIds(storedRegistrations ? new Set(JSON.parse(storedRegistrations)) : new Set());
      const storedNotes = localStorage.getItem(`notes_${studentProfile.email}`);
      setWorkshopNotes(storedNotes ? JSON.parse(storedNotes) : {});
      const storedRatings = localStorage.getItem(`ratings_${studentProfile.email}`);
      setWorkshopRatings(storedRatings ? JSON.parse(storedRatings) : {});
    }
  }, [studentProfile]);

  useEffect(() => {
    loadData();
     // Persist workshops to localStorage initially if not already there
     if (!localStorage.getItem('studentWorkshopsAll')) {
        localStorage.setItem('studentWorkshopsAll', JSON.stringify(
            DUMMY_WORKSHOPS.map(ws => ({
                ...ws, 
                attendees: [], 
                chatMessages: ws.type === 'live' ? [] : undefined,
                attendedBy: [],
                workshopOverallRatings: {}, 
            }))
        ));
    }
  }, [loadData]); // loadData will only change if studentProfile changes, so this runs once on mount mostly

  useEffect(() => {
    if (studentProfile?.email && workshops.length > 0 && registeredWorkshopIds.size > 0) {
        workshops.forEach(ws => {
            if (registeredWorkshopIds.has(ws.id) && 
                new Date(ws.date) > new Date() && 
                new Date(ws.date) < new Date(new Date().getTime() + 24 * 60 * 60 * 1000)) {
                console.log(`Simulated Notification: Workshop "${ws.title}" is upcoming.`);
            }
        });
    }
  }, [studentProfile, workshops, registeredWorkshopIds]);


  const updateWorkshopData = (workshopId, updatedDataOrFn) => {
    setWorkshops(prevWorkshops => {
        const updatedWorkshops = prevWorkshops.map(ws => {
            if (ws.id === workshopId) {
                const dataToUpdate = typeof updatedDataOrFn === 'function' 
                                    ? updatedDataOrFn(ws) 
                                    : updatedDataOrFn;
                return { ...ws, ...dataToUpdate };
            }
            return ws;
        });
        localStorage.setItem('studentWorkshopsAll', JSON.stringify(updatedWorkshops));
        return updatedWorkshops;
    });
  };

  const handleRegister = (workshopId) => { /* ... (no change from previous correct version) ... */ };
  const handleUnregister = (workshopId) => { /* ... (no change from previous correct version) ... */ };

  const markAsAttendedAfterLive = useCallback((workshopId) => {
    if (!studentProfile?.email) return;
    
    const workshop = workshops.find(ws => ws.id === workshopId);
    if (workshop && workshop.type === 'live' && isRegistered(workshopId)) {
        const startTime = new Date(workshop.date);
        const durationString = workshop.duration || "60 minutes";
        const match = durationString.match(/\d+/);
        const durationMinutes = match ? parseInt(match[0], 10) : 60;
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        if (new Date() >= endTime) { 
             if (!(workshop.attendedBy || []).includes(studentProfile.email)) {
                updateWorkshopData(workshopId, (currentWs) => ({ 
                    attendedBy: [...(currentWs.attendedBy || []), studentProfile.email] 
                }));
                console.log(`StudentWorkshops: Marked ${studentProfile.email} as attended for ${workshopId}`);
            }
        }
    }
  }, [studentProfile, workshops, isRegistered, updateWorkshopData]); 

  const handleSelectWorkshop = (workshop) => {
    setSelectedWorkshop(workshop);
    if (workshop.type === 'live') {
        const storedWorkshopData = workshops.find(ws => ws.id === workshop.id);
        setChatMessages(prev => ({ ...prev, [workshop.id]: storedWorkshopData?.chatMessages || [] }));
    }
    if (studentProfile?.email && new Date(workshop.date) < new Date() && isRegistered(workshop.id) && workshop.type === 'live') {
        markAsAttendedAfterLive(workshop.id); 
    }
  };

  const handleNoteChange = (workshopId, notes) => { /* ... (no change) ... */ };
  const handleRatingSubmit = (workshopId, rating, feedback) => { /* ... (no change) ... */ };
  const handleSendChatMessage = (workshopId, messageText) => { /* ... (no change) ... */ };
  
  const canGetCertificate = (workshopId) => { /* ... (no change) ... */ };
  const handleViewCertificate = (workshopId) => setShowCertificate(workshopId);
  const playVideo = () => videoRef.current?.play();
  const pauseVideo = () => videoRef.current?.pause();
  const stopVideo = () => { /* ... (no change) ... */ };

  if (!studentProfile) { 
    return <div style={styles.pageContainer}><p>Please log in to view workshops.</p> <button onClick={() => navigate('/studentlogin')} style={styles.buttonPrimary}>Login</button></div>;
   }

  return (
    <div style={styles.pageContainer}>
      <button onClick={() => navigate('/studentpage', {state: {student: studentProfile}})} style={styles.backButton}>← Back to Dashboard</button>
      <h1 style={styles.header}>Career Workshops</h1>

      {!selectedWorkshop ? (
        <>
          <h2 style={styles.subHeader}>Upcoming & Ongoing Live Workshops</h2>
          {workshops.filter(ws => {
              if (ws.type !== 'live') return false;
              const startTime = new Date(ws.date);
              const now = new Date();
              const durationString = ws.duration || "60 minutes";
              const match = durationString.match(/\d+/);
              const durationMinutes = match ? parseInt(match[0], 10) : 60;
              const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
              return now < endTime; 
          }).length > 0 ? (
            <div style={styles.workshopList}>
              {workshops.filter(ws => {
                  if (ws.type !== 'live') return false;
                  const startTime = new Date(ws.date);
                  const now = new Date();
                  const durationString = ws.duration || "60 minutes";
                  const match = durationString.match(/\d+/);
                  const durationMinutes = match ? parseInt(match[0], 10) : 60;
                  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
                  return now < endTime; 
              }).sort((a,b) => new Date(a.date) - new Date(b.date)).map(ws => (
                <WorkshopCard 
                    key={ws.id} 
                    workshop={ws} 
                    onSelect={handleSelectWorkshop} 
                    onRegister={handleRegister} 
                    onUnregister={handleUnregister} 
                    isRegistered={isRegistered(ws.id)} 
                />
              ))}
            </div>
          ) : <p>No upcoming or ongoing live workshops.</p>}

          <h2 style={styles.subHeader}>Recorded Workshops</h2>
           {workshops.filter(ws => ws.type === 'recorded').length > 0 ? (
            <div style={styles.workshopList}>
              {workshops.filter(ws => ws.type === 'recorded').map(ws => (
                <WorkshopCard key={ws.id} workshop={ws} onSelect={handleSelectWorkshop} onRegister={handleRegister} onUnregister={handleUnregister} isRegistered={isRegistered(ws.id)} />
              ))}
            </div>
          ) : <p>No recorded workshops available.</p>}
        </>
      ) : (
        <WorkshopDetails 
            workshop={selectedWorkshop} 
            onClose={() => setSelectedWorkshop(null)}
            isRegistered={isRegistered(selectedWorkshop.id)}
            onRegister={handleRegister}
            onUnregister={handleUnregister}
            notes={workshopNotes[selectedWorkshop.id] || ""}
            onNoteChange={handleNoteChange}
            ratingData={workshopRatings[selectedWorkshop.id] || { rating: 0, feedback: "" }}
            onRatingSubmit={handleRatingSubmit}
            chatMessages={chatMessages[selectedWorkshop.id] || []}
            onSendChatMessage={handleSendChatMessage}
            videoRef={videoRef}
            playVideo={playVideo}
            pauseVideo={pauseVideo}
            stopVideo={stopVideo}
            showCertificateButton={canGetCertificate(selectedWorkshop.id)} 
            onViewCertificate={handleViewCertificate}
            currentUserEmail={studentProfile.email}
            markAsAttended={markAsAttendedAfterLive} 
            studentProfile={studentProfile} 
        />
      )}

      {showCertificate && workshops.find(ws => ws.id === showCertificate) && (
        <CertificateModal 
            workshopName={workshops.find(ws => ws.id === showCertificate)?.title || "Workshop"}
            studentName={studentProfile.name || studentProfile.email}
            completionDate={
              new Date(
                workshops.find(ws => ws.id === showCertificate)?.date || Date.now() 
              ).toLocaleDateString()
            }
            onClose={() => setShowCertificate(null)}
        />
      )}
    </div>
  );
}


const WorkshopCard = ({ workshop, onSelect, onRegister, onUnregister, isRegistered }) => {
    // Calculate if live workshop is ongoing for card display
    let isOngoingLive = false;
    if (workshop.type === 'live') {
        const startTime = new Date(workshop.date);
        const now = new Date();
        const durationString = workshop.duration || "60 minutes";
        const match = durationString.match(/\d+/);
        const durationMinutes = match ? parseInt(match[0], 10) : 60;
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
        isOngoingLive = now >= startTime && now < endTime;
    }

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>{workshop.title}</h3>
            <p style={styles.cardDate}>
            {workshop.type === 'live' 
                ? `Live: ${new Date(workshop.date).toLocaleString()}` 
                : `Recorded (Available Now)`}
            {isOngoingLive && <span style={{color: 'red', fontWeight: 'bold'}}> (LIVE NOW)</span>}
            </p>
            <p style={styles.cardInstructor}>Instructor: {workshop.instructor}</p>
            <p style={styles.cardDuration}>Duration: {workshop.duration}</p>
            <p style={styles.cardDescription}>{workshop.description.substring(0,100)}...</p>
            <div style={styles.cardActions}>
                <button onClick={() => onSelect(workshop)} style={styles.buttonPrimary}>View Details</button>
                {workshop.type === 'live' && new Date(workshop.date) >= new Date() && !isOngoingLive && ( // Only show register/unregister if not ongoing yet
                    isRegistered ? 
                    <button onClick={() => onUnregister(workshop.id)} style={{...styles.buttonSecondary, backgroundColor: '#dc3545'}}>Unregister</button> :
                    <button onClick={() => onRegister(workshop.id)} style={styles.buttonSecondary}>Register</button>
                )}
                {workshop.type === 'recorded' && (
                    isRegistered ? 
                    <span style={{marginLeft: '10px', color: 'green', fontSize: '0.9em'}}>✓ In My List</span> :
                    <button onClick={() => onRegister(workshop.id)} style={{...styles.buttonSecondary, fontSize:'0.8em'}}>Add to My List</button>
                )}
            </div>
        </div>
    );
};

const WorkshopDetails = ({ 
    workshop, onClose, isRegistered, onRegister, onUnregister,
    notes, onNoteChange, ratingData, onRatingSubmit,
    chatMessages, onSendChatMessage,
    videoRef, playVideo, pauseVideo, stopVideo,
    showCertificateButton, 
    onViewCertificate, currentUserEmail,
    markAsAttended, 
    studentProfile 
}) => {
  const [currentRating, setCurrentRating] = useState(ratingData?.rating || 0);
  const [feedback, setFeedback] = useState(ratingData?.feedback || "");
  const [chatInput, setChatInput] = useState("");
  const chatBoxRef = useRef(null);
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [isCurrentlyLiveTime, setIsCurrentlyLiveTime] = useState(false);
  const workshopEndTimeRef = useRef(null);
  const hasJoinedSessionRef = useRef(false); 

  useEffect(() => {
    setCurrentRating(ratingData?.rating || 0);
    setFeedback(ratingData?.feedback || "");
  }, [ratingData]);


  useEffect(() => { 
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages, isLiveSessionActive]);

  useEffect(() => {
    if (workshop.type === 'live') {
      const startTime = new Date(workshop.date);
      const durationString = workshop.duration || "60 minutes"; 
      
      const match = durationString.match(/\d+/); 
      const durationMinutes = match ? parseInt(match[0], 10) : 60; 

      workshopEndTimeRef.current = new Date(startTime.getTime() + durationMinutes * 60000);

      const checkLiveStatus = () => {
        const now = new Date();
        const live = now >= startTime && now < workshopEndTimeRef.current;
        setIsCurrentlyLiveTime(live);
        
        if (isLiveSessionActive && !live && hasJoinedSessionRef.current) {
            handleLeaveLiveSession(true); 
        }
      };

      checkLiveStatus(); 
      const interval = setInterval(checkLiveStatus, 30000); 
      return () => clearInterval(interval);
    } else {
        setIsCurrentlyLiveTime(false); 
    }
  }, [workshop.date, workshop.duration, workshop.type, isLiveSessionActive, hasJoinedSessionRef]); // Added hasJoinedSessionRef

  useEffect(() => {
    return () => {
      if (isLiveSessionActive && hasJoinedSessionRef.current && workshop.type === 'live') {
        if (workshopEndTimeRef.current && new Date() >= workshopEndTimeRef.current) {
            markAsAttended(workshop.id);
        }
      }
    };
  }, [isLiveSessionActive, workshop.id, workshop.type, markAsAttended]); // markAsAttended is a dependency


  const handleLocalRatingSubmit = (e) => {
    e.preventDefault();
    onRatingSubmit(workshop.id, currentRating, feedback);
   };
  const handleLocalChatSubmit = (e) => {
    e.preventDefault();
    onSendChatMessage(workshop.id, chatInput);
    setChatInput("");
   };

  const isWorkshopPast = new Date(workshop.date) < new Date() && (!workshopEndTimeRef.current || new Date() > workshopEndTimeRef.current);

  const handleJoinLiveSession = () => {
    if (isCurrentlyLiveTime && isRegistered) {
      setIsLiveSessionActive(true);
      hasJoinedSessionRef.current = true; 
      console.log(`${studentProfile.email} joined live session for ${workshop.title}`);
    } else if (!isRegistered) {
      alert("Please register for the workshop to join the live session.");
    } else {
      alert("The workshop is not currently live or has ended.");
    }
  };

  const handleLeaveLiveSession = (sessionEndedNaturally = false) => {
    setIsLiveSessionActive(false);
    if (hasJoinedSessionRef.current && isRegistered) {
        if ((workshopEndTimeRef.current && new Date() >= workshopEndTimeRef.current) || sessionEndedNaturally) {
            markAsAttended(workshop.id); 
        }
    }
    hasJoinedSessionRef.current = false; 
  };

  if (isLiveSessionActive) {
    return (
      <div style={styles.detailsContainer}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2 style={styles.detailsHeader}>{workshop.title} - Live Session</h2>
            <button onClick={() => handleLeaveLiveSession(false)} style={{...styles.buttonSecondary, backgroundColor: '#dc3545'}}>Leave Session</button>
        </div>
        <div style={styles.liveSessionLayout}>
            <div style={styles.liveVideoPlaceholder}>
                <p style={{fontSize: '1.5em'}}>🎬</p>
                <p>Live Video Stream Area</p>
                <p><small>(Simulated - No actual video)</small></p>
                <p>Instructor: {workshop.instructor}</p>
            </div>
            {isRegistered && (
                 <div style={styles.chatSectionLive}>
                    <h4>Live Chat</h4>
                    <div ref={chatBoxRef} style={styles.chatMessagesArea}>
                        {chatMessages.map((msg, index) => (
                            <div key={index} style={msg.sender === currentUserEmail ? styles.chatMessageSent : styles.chatMessageReceived}>
                                <strong>{msg.sender === currentUserEmail ? "You" : msg.sender.split('@')[0]}: </strong>{msg.text}
                                <span style={styles.chatTimestamp}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                        {chatMessages.length === 0 && <p style={{textAlign:'center', color:'#999'}}>Chat is live! Be the first to message.</p>}
                    </div>
                    <form onSubmit={handleLocalChatSubmit} style={styles.chatInputForm}>
                        <input 
                            type="text" 
                            value={chatInput} 
                            onChange={(e) => setChatInput(e.target.value)} 
                            placeholder="Type your message..."
                            style={styles.chatInput}
                        />
                        <button type="submit" style={styles.buttonPrimary}>Send</button>
                    </form>
                </div>
            )}
        </div>
        <div style={{...styles.notesSection, marginTop: '20px'}}>
            <h4>My Notes (Live)</h4>
            <textarea 
              value={notes} 
              onChange={(e) => onNoteChange(workshop.id, e.target.value)}
              placeholder="Take notes during the live session..."
              rows={5}
              style={styles.textarea} 
            />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.detailsContainer}>
      <button onClick={onClose} style={styles.backButtonClose}>← Back to Workshops</button>
      <h2 style={styles.detailsHeader}>{workshop.title}</h2>
      <p><strong>Instructor:</strong> {workshop.instructor}</p>
      <p><strong>Date:</strong> {new Date(workshop.date).toLocaleString()} ({workshop.type})</p>
      <p><strong>Duration:</strong> {workshop.duration}</p>
      <p style={{ lineHeight: 1.6, marginBottom: '20px' }}>{workshop.description}</p>

      {workshop.type === 'live' && (
        isRegistered ? 
        <>
          {isCurrentlyLiveTime ? (
            <button onClick={handleJoinLiveSession} style={{...styles.buttonPrimary, backgroundColor: '#28a745', marginRight: '10px'}}>
              Join Live Session Now
            </button>
          ) : ( 
            isWorkshopPast ? 
              (showCertificateButton ? 
                <p style={{color: 'green', fontStyle: 'italic', fontWeight:'bold'}}>Status: Attended</p> :
                <p style={{color: 'red', fontStyle: 'italic', fontWeight:'bold'}}>Status: Missed</p> 
              ) : 
              <p style={{color: '#17a2b8', fontStyle: 'italic'}}>
                {`Live session starts: ${new Date(workshop.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </p>
          )}
          {/* Unregister only for future or if not yet started and not past end time */}
          {new Date(workshop.date) >= new Date() && (!workshopEndTimeRef.current || new Date() < workshopEndTimeRef.current) &&
            <button onClick={() => onUnregister(workshop.id)} style={{...styles.buttonSecondary, backgroundColor: '#dc3545'}}>Unregister</button>
          }
        </>
        : (new Date(workshop.date) >= new Date() && 
            <button onClick={() => onRegister(workshop.id)} style={styles.buttonPrimary}>Register to Attend</button>
          )
      )}
      
      {workshop.type === 'live' && isWorkshopPast && !isCurrentlyLiveTime && !isRegistered && ( 
         <p style={{fontStyle:'italic', color: '#555'}}>This live workshop has concluded. (Not registered)</p>
      )}

      {workshop.type === 'recorded' && workshop.videoUrl && (
        <div style={styles.videoSection}>
          <h4>Workshop Video</h4>
          <video ref={videoRef} width="100%" controls style={{borderRadius: '4px', backgroundColor: '#000'}}>
            <source src={workshop.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div style={styles.videoControls}>
            <button onClick={playVideo} style={styles.controlButton}>Play ▶</button>
            <button onClick={pauseVideo} style={styles.controlButton}>Pause ❚❚</button>
            <button onClick={stopVideo} style={styles.controlButton}>Stop ■</button>
          </div>
        </div>
      )}

      {(!isLiveSessionActive || workshop.type === 'recorded') && (
        <div style={styles.notesSection}>
            <h4>My Notes</h4>
            <textarea 
            value={notes} 
            onChange={(e) => onNoteChange(workshop.id, e.target.value)}
            placeholder="Take notes here..."
            rows={5}
            style={styles.textarea} 
            />
        </div>
      )}

      {(isWorkshopPast || workshop.type === 'recorded') && isRegistered && (
        <form onSubmit={handleLocalRatingSubmit} style={styles.ratingSection}>
          <h4>Rate this Workshop</h4>
          <div>
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                onClick={() => setCurrentRating(star)} 
                style={{...styles.star, color: star <= currentRating ? 'gold' : 'lightgray', cursor:'pointer'}}
              >
                ★
              </span>
            ))}
          </div>
          <textarea 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add your feedback (optional)"
            rows={3}
            style={{...styles.textarea, marginTop: '10px'}} 
          />
          <button type="submit" style={{...styles.buttonPrimary, marginTop: '10px'}}>Submit Rating</button>
        </form>
      )}

      {showCertificateButton && ( 
        <div style={{marginTop: '20px', textAlign: 'center'}}>
            <button onClick={() => onViewCertificate(workshop.id)} style={{...styles.buttonPrimary, backgroundColor: '#28a745'}}>
                View Certificate of Attendance
            </button>
        </div>
      )}
    </div>
  );
};

const CertificateModal = ({ workshopName, studentName, completionDate, onClose }) => (
    <div style={styles.modalOverlay}>
        <div style={{...styles.modalContent, maxWidth: '700px', textAlign:'center'}}>
            <h2 style={{color: '#28a745'}}>Certificate of Attendance</h2>
            <div style={{border: '2px solid #28a745', padding: '30px', margin: '20px 0', borderRadius: '8px', backgroundColor: '#f9f9f9'}}>
                <p style={{fontSize: '1.1em'}}>This certificate is proudly presented to</p>
                <p style={{fontSize: '1.8em', fontWeight: 'bold', margin: '15px 0', color: '#007bff'}}>{studentName}</p>
                <p style={{fontSize: '1.1em'}}>for successfully attending the workshop</p>
                <p style={{fontSize: '1.5em', fontStyle: 'italic', margin: '15px 0'}}>{workshopName}</p>
                <p style={{fontSize: '1em'}}>Completed on: {completionDate}</p>
            </div>
            <button onClick={onClose} style={{...styles.buttonPrimary, backgroundColor: '#6c757d'}}>Close</button>
        </div>
    </div>
);

const styles = {
  pageContainer: {
    maxWidth: '1000px',
    margin: '20px auto',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: '#007bff',
    fontSize: '1em',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  backButtonClose: { 
    background: 'transparent',
    border: 'none',
    color: '#007bff',
    fontSize: '1em',
    cursor: 'pointer',
    marginBottom: '15px',
    display: 'block', 
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  subHeader: {
    color: '#007bff',
    borderBottom: '2px solid #007bff',
    paddingBottom: '5px',
    marginTop: '30px',
    marginBottom: '20px',
  },
  workshopList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    marginTop: 0,
    color: '#0056b3',
    fontSize: '1.2em',
  },
  cardDate: { fontSize: '0.9em', color: '#555', marginBottom: '5px'},
  cardInstructor: { fontSize: '0.9em', color: '#555', marginBottom: '5px'},
  cardDuration: { fontSize: '0.9em', color: '#555', marginBottom: '10px'},
  cardDescription: { 
      fontSize: '0.95em', 
      color: '#444', 
      lineHeight: 1.5,
      flexGrow: 1, 
      marginBottom: '15px',
    },
  cardActions: {
    marginTop: 'auto', 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  detailsHeader: { color: '#007bff', marginBottom: '20px'},
  buttonPrimary: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'background-color 0.2s',
  },
  videoSection: { margin: '20px 0', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#fff'},
  videoControls: { marginTop: '10px', display: 'flex', gap: '10px'},
  controlButton: { padding: '8px 10px', fontSize: '0.9em', cursor: 'pointer', borderRadius:'4px', border: '1px solid #ccc'},
  notesSection: { margin: '20px 0', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#fff'},
  textarea: { width: 'calc(100% - 22px)', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px', boxSizing: 'border-box'},
  ratingSection: { margin: '20px 0', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#fff'},
  star: { fontSize: '1.8em', marginRight: '5px'},
  chatSection: { margin: '20px 0', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#fff'}, 
  chatMessagesArea: {
    height: '200px', 
    overflowY: 'auto',
    border: '1px solid #ccc',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa'
  },
  chatMessageSent: {
    textAlign: 'right',
    marginBottom: '8px',
    padding: '6px 10px',
    backgroundColor: '#d1e7dd', 
    borderRadius: '10px 10px 0 10px',
    marginLeft: 'auto',
    maxWidth: '70%',
    wordWrap: 'break-word',
  },
  chatMessageReceived: {
    textAlign: 'left',
    marginBottom: '8px',
    padding: '6px 10px',
    backgroundColor: '#e9ecef', 
    borderRadius: '10px 10px 10px 0',
    marginRight: 'auto',
    maxWidth: '70%',
    wordWrap: 'break-word',
  },
  chatTimestamp: {
    display: 'block',
    fontSize: '0.75em',
    color: '#777',
    marginTop: '3px',
  },
  chatInputForm: { display: 'flex', gap: '10px'},
  chatInput: { flexGrow: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc'},
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1001,
  },
  modalContent: {
    backgroundColor: 'white', padding: '25px', borderRadius: '8px',
    width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
  liveSessionLayout: {
    display: 'flex',
    flexDirection: 'column', 
    gap: '20px',
    marginTop: '20px',
  },
  liveVideoPlaceholder: {
    height: '300px', 
    backgroundColor: '#e9ecef', 
    color: '#495057',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    textAlign: 'center',
    padding: '20px',
    border: '2px dashed #adb5bd'
  },
  chatSectionLive: { 
    flexGrow: 1, 
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '400px', 
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    padding: '10px',
    backgroundColor: '#fff'
  },
};

export default StudentWorkshops;