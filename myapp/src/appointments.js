"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "./sidebarscad"
import SidebarStudent from "./sidebarpro"
import { sendAppointmentRequest, getAppointmentsByEmail, updateAppointmentById } from "./requests"
import { getNotification, clearNotifications, setNotification as setNotificationUtil } from "./notification"

const AppointmentPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notificationState, setNotificationState] = useState({ show: false, message: "", type: "" })
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [viewedNotifications, setViewedNotifications] = useState([])
  const [appointments, setAppointments] = useState([])
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [appointmentDetails, setAppointmentDetails] = useState({
    purpose: "",
    message: "",
    recipient: "",
  })
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showCallModal, setShowCallModal] = useState(false)
  const [callStatus, setCallStatus] = useState("") // States: "", "dialing", "incoming", "ongoing", "ended", "remote_ended_show_message"
  const [callSettings, setCallSettings] = useState({
    video: true,
    audio: true,
    screenShare: false,
  })
  const [incomingCall, setIncomingCall] = useState(null)
  const [studentEmails, setStudentEmails] = useState([])
  const [callDuration, setCallDuration] = useState(0)
  const [callTimer, setCallTimer] = useState(null)

  const userType = location.state?.type || "student"
  const isSCAD = userType === "scad"
  const isFaculty = userType === "faculty"
  const isStudent = userType === "student" || (!isSCAD && !isFaculty)
  const student = location.state?.user || location.state?.studentj || location.state?.student || {}
    const allUsers = JSON.parse(localStorage.getItem("allUsers")) || []
  const s = allUsers.find((user) => user.email === student.email)
  const studentrole = s?.role // Added optional chaining for safety
  const scadmail = "scad@example.com"
  const studentmail = student.email
  const userEmail = isSCAD ? scadmail : studentmail
  const viewedNotificationsKey = `viewedNotifications_${userEmail}`

  const [processedCallNotificationIds, setProcessedCallNotificationIds] = useState(() => {
    const currentEmailForStorage = (isSCAD ? scadmail : student.email) || "unknown_user_init";
    if (typeof window !== 'undefined' && currentEmailForStorage !== "unknown_user_init") {
      const key = `processedCallNotificationIds_${currentEmailForStorage}`;
      try {
        const saved = localStorage.getItem(key);
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch (e) {
        console.error("Failed to parse processedCallNotificationIds from localStorage:", e);
        return new Set();
      }
    }
    return new Set();
  });

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const notificationRef = useRef(null)

  const previousCallStatusRef = useRef("");
  useEffect(() => {
      previousCallStatusRef.current = callStatus;
  }, [callStatus]);


  useEffect(() => {
    if (typeof window !== 'undefined' && userEmail) {
      const key = `processedCallNotificationIds_${userEmail}`;
      try {
        localStorage.setItem(key, JSON.stringify(Array.from(processedCallNotificationIds)));
      } catch (e) {
        console.error("Failed to save processedCallNotificationIds to localStorage:", e);
      }
    }
  }, [processedCallNotificationIds, userEmail]);


  const showNotification = (message, type = "info") => {
    setNotificationState({ show: true, message, type })
    setTimeout(() => {
      setNotificationState({ show: false, message: "", type: "" })
    }, 3000)
  }

  useEffect(() => {
    setLoading(true)
    try {
      if (userEmail) {
        const userAppointments = getAppointmentsByEmail(userEmail)
        setAppointments(userAppointments)
      }
      const savedViewedNotifications = localStorage.getItem(viewedNotificationsKey)
      if (savedViewedNotifications) {
        setViewedNotifications(JSON.parse(savedViewedNotifications))
      }
      if (isSCAD) {
        try {
          const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
          const studentUsers = allUsers.filter((user) => user.role === "student"|| user.role==="pro")
          const emails = studentUsers.map((user) => user.email)
          setStudentEmails(emails)
          if (emails.length > 0) {
            setAppointmentDetails((prev) => ({ ...prev, recipient: emails[0] }))
          }
        } catch (err) {
          console.error("Error loading student emails:", err)
          setStudentEmails([])
        }
      }
      setTimeout(() => {
        setLoading(false)
        showNotification("Welcome to Appointments", "info")
      }, 800)
    } catch (err) {
      console.error("Error loading data:", err)
      setLoading(false)
    }
  }, [userEmail, viewedNotificationsKey, isSCAD])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        !event.target.closest('[data-bell-icon="true"]')
      ) {
        setIsPopupOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (callStatus === "ongoing") {
      const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
      setCallTimer(timer);
      return () => {
        clearInterval(timer);
      };
    } else if (callStatus !== "ongoing" && callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  useEffect(() => {
    if (userEmail) {
        const interval = setInterval(() => {
            try {
                const rawNewNotifications = getNotification(userEmail) || [];
                if (JSON.stringify(rawNewNotifications) !== JSON.stringify(notifications)) {
                    setNotifications(rawNewNotifications);
                }

                const actionableNotifications = rawNewNotifications.filter(
                    notif => {
                      const notifId = notif.id || notif.timestamp;
                      return !processedCallNotificationIds.has(notifId) &&
                             (notif.message.includes("appointment") || notif.message.includes("call"));
                    }
                );

                if (actionableNotifications.length > 0) {
                    let notificationsProcessedInThisCycle = new Set();

                    const callNotification = actionableNotifications.find(notif => notif.message.includes("incoming call"));
                    if (callNotification && !incomingCall && callStatus !== "ongoing" && callStatus !== "incoming" && callStatus !== "dialing") {
                        const callerMatch = callNotification.message.match(/from ([^ ]+)/);
                        const caller = callerMatch ? callerMatch[1] : "Unknown";
                        const callNotifId = callNotification.id || callNotification.timestamp;
                        
                        setIncomingCall({
                            from: caller, id: callNotifId,
                            timestamp: new Date().toISOString(), originalNotificationId: callNotifId
                        });
                        setCallStatus("incoming"); setShowCallModal(true);
                        notificationsProcessedInThisCycle.add(callNotifId);
                    }

                    const callAcceptedNotification = actionableNotifications.find(notif => notif.message.includes("accepted the call"));
                    if (callAcceptedNotification && callStatus === "dialing" && selectedAppointment) {
                        const accepter = callAcceptedNotification.message.split(" ")[0];
                        const otherParty = selectedAppointment.from === userEmail ? selectedAppointment.to : selectedAppointment.from;
                        if (accepter === otherParty) {
                            setCallStatus("ongoing");
                            showNotification(`${accepter} has joined the call.`, "success");
                            notificationsProcessedInThisCycle.add(callAcceptedNotification.id || callAcceptedNotification.timestamp);
                        }
                    }
                    
                    const callDeclinedNotification = actionableNotifications.find(notif => notif.message.includes("declined your call"));
                    if (callDeclinedNotification && callStatus === "dialing" && selectedAppointment) {
                        const decliner = callDeclinedNotification.message.split(" ")[0];
                        const otherParty = selectedAppointment.from === userEmail ? selectedAppointment.to : selectedAppointment.from;
                        if (decliner === otherParty) {
                            showNotification(`${decliner} declined the call.`, "info");
                            setCallStatus("remote_ended_show_message"); 
                            setShowCallModal(true); 
                            notificationsProcessedInThisCycle.add(callDeclinedNotification.id || callDeclinedNotification.timestamp);
                        }
                    }

                    const callEndedNotification = actionableNotifications.find(notif => notif.message.includes("left the call"));
                    if (callEndedNotification) {
                        const leavingUserMatch = callEndedNotification.message.match(/^([^ ]+)/);
                        const leavingUser = leavingUserMatch ? leavingUserMatch[1] : null;
                        let processedEndCall = false;
                        const callEndedNotifId = callEndedNotification.id || callEndedNotification.timestamp;

                        if (callStatus === "ongoing") {
                            const otherParty = selectedAppointment?.from === userEmail ? selectedAppointment?.to : selectedAppointment?.from;
                            if (leavingUser && leavingUser === otherParty) {
                                showNotification("The other participant has left the call", "info");
                                if (callTimer) { clearInterval(callTimer); setCallTimer(null); }
                                setCallStatus("remote_ended_show_message");
                                setShowCallModal(true);
                                processedEndCall = true;
                            }
                        } else if (callStatus === "incoming" && incomingCall?.from === leavingUser) {
                            showNotification(`${leavingUser || 'The caller'} cancelled the call.`, "info");
                            setCallStatus("");
                            setShowCallModal(false);
                            setIncomingCall(null);
                            processedEndCall = true;
                        } else if (callStatus === "dialing" && selectedAppointment && (selectedAppointment.to === leavingUser || selectedAppointment.from === leavingUser)) {
                            showNotification(`${leavingUser || 'The other party'} ended the call attempt.`, "info");
                             if (callTimer) { clearInterval(callTimer); setCallTimer(null); }
                             setCallStatus("remote_ended_show_message"); 
                             setShowCallModal(true);
                             processedEndCall = true;
                        }

                        if (processedEndCall) {
                           notificationsProcessedInThisCycle.add(callEndedNotifId);
                        }
                    }
                    
                    if (notificationsProcessedInThisCycle.size > 0) {
                        setProcessedCallNotificationIds(prev => {
                            const newSet = new Set(prev);
                            notificationsProcessedInThisCycle.forEach(id => newSet.add(id));
                            return newSet;
                        });
                    }
                    
                    const anyRelevantNotifForAppointments = rawNewNotifications.some(notif => 
                        (notif.message.includes("appointment")) &&
                        !processedCallNotificationIds.has(notif.id || notif.timestamp)
                    );

                    if (JSON.stringify(rawNewNotifications) !== JSON.stringify(notifications) && anyRelevantNotifForAppointments) {
                         const userAppointments = getAppointmentsByEmail(userEmail);
                         setAppointments(userAppointments);
                    }
                }
            } catch (err) {
                console.error("Error processing notifications:", err);
            }
        }, 3000);
        return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, notifications, incomingCall, callStatus, selectedAppointment, processedCallNotificationIds, callTimer]); 

  const unreadNotifications = notifications.filter((notification) => {
    return !viewedNotifications.includes(notification.id || notification.timestamp)
  })

  const handleLogout = () => setConfirmLogout(true)

  const confirmLogoutAction = (confirm) => {
    setConfirmLogout(false)
    if (confirm) {
      setLoading(true)
      showNotification("Logging out...", "info")
      setTimeout(() => navigate("/"), 1000)
    }
  }

  const toggleMenu = () => setMenuOpen(!menuOpen)

  const handleBellClick = (e) => {
    e.stopPropagation()
    if (userEmail) {
      const fetchedNotifications = getNotification(userEmail) || []
      setNotifications(fetchedNotifications)
      setIsPopupOpen(true)
      setNotificationState({ show: false, message: "", type: "" })
      const notificationIds = fetchedNotifications.map((n) => n.id || n.timestamp)
      const updatedViewed = [...new Set([...viewedNotifications, ...notificationIds])]
      setViewedNotifications(updatedViewed)
      localStorage.setItem(viewedNotificationsKey, JSON.stringify(updatedViewed))
    } else {
      console.warn("User email not available for notifications.")
    }
  }

  const handleAppointmentAction = (appointment, action) => {
    if (appointment.id) {
      updateAppointmentById(appointment.id, { status: action })
    } else {
      const allApps = JSON.parse(localStorage.getItem("appointments") || "[]")
      const updatedApps = allApps.map(app => 
        (app.from === appointment.from && app.to === appointment.to && app.timestamp === appointment.timestamp)
        ? { ...app, status: action } : app
      )
      localStorage.setItem("appointments", JSON.stringify(updatedApps))
    }
    setAppointments(prev => prev.map(app =>
      ((app.id && app.id === appointment.id) || (!app.id && app.from === appointment.from && app.to === appointment.to && app.timestamp === appointment.timestamp))
      ? { ...app, status: action } : app
    ))
    const recipient = appointment.from === userEmail ? appointment.to : appointment.from
    setNotificationUtil(`Your appointment request has been ${action} by ${userEmail}`, recipient, false)
    showNotification(`Appointment ${action} successfully`, "success")
    setTimeout(() => {
      if (userEmail) setAppointments(getAppointmentsByEmail(userEmail))
    }, 500)
  }

  const handleClosePopup = () => {
    if (userEmail) {
      clearNotifications(userEmail); 
      setNotifications([]);
      setViewedNotifications([]);
      localStorage.removeItem(viewedNotificationsKey);

      setProcessedCallNotificationIds(new Set());
      if (typeof window !== 'undefined') {
        const key = `processedCallNotificationIds_${userEmail}`;
        localStorage.removeItem(key);
      }
    }
    setIsPopupOpen(false);
    showNotification("All notifications cleared", "info");
  };

  const handleRequestAppointment = () => {
    setAppointmentDetails({
      purpose: isStudent ? "Career Guidance" : "Report Clarification",
      message: "",
      recipient: isSCAD && studentEmails.length > 0 ? studentEmails[0] : "",
    })
    setShowRequestModal(true)
  }

  const handleViewAppointments = () => {
    if (userEmail) setAppointments(getAppointmentsByEmail(userEmail))
    setShowAppointmentModal(true)
  }

  const handleAppointmentSubmit = () => {
    if (!appointmentDetails.purpose || (isSCAD && !appointmentDetails.recipient)) {
      showNotification("Please fill in all required fields", "error")
      return
    }
    let recipientEmail = isStudent ? scadmail : (isSCAD ? appointmentDetails.recipient : scadmail)
    const timestamp = new Date().toISOString()
    const id = `${userEmail}-${recipientEmail}-${timestamp}`.replace(/[^a-zA-Z0-9-_]/g, '');

    const newAppointment = {
      from: userEmail, to: recipientEmail, purpose: appointmentDetails.purpose,
      message: appointmentDetails.message || `Request for ${appointmentDetails.purpose}`,
      status: "pending", timestamp, id,
    }
    sendAppointmentRequest(newAppointment)
    setNotificationUtil(`New appointment request from ${userEmail} for ${appointmentDetails.purpose}`, recipientEmail, false)
    setTimeout(() => {
      if (userEmail) setAppointments(getAppointmentsByEmail(userEmail))
    }, 500)
    setAppointmentDetails({ purpose: "", message: "", recipient: isSCAD && studentEmails.length > 0 ? studentEmails[0] : "" })
    setShowRequestModal(false)
    showNotification("Appointment request sent successfully", "success")
  }

  const handleStartCall = (appointment) => {
    setSelectedAppointment(appointment);
    setCallStatus("dialing");
    setShowCallModal(true);
    setCallDuration(0);
    const recipient = appointment.from === userEmail ? appointment.to : appointment.from;
    setNotificationUtil(`You have an incoming call from ${userEmail} regarding ${appointment.purpose}`, recipient, false);
    initializeVideoCall();
  }

  const handleIncomingCall = (accept) => {
    const callIdToProcess = incomingCall?.originalNotificationId;

    if (accept) {
      setCallStatus("ongoing");
      setCallDuration(0);
      const relatedAppointment = appointments.find(app =>
        app.status === 'accepted' &&
        ((app.from === incomingCall?.from && app.to === userEmail) ||
         (app.to === incomingCall?.from && app.from === userEmail)) &&
        (incomingCall?.purpose ? app.purpose === incomingCall.purpose : true) 
      ) || { 
          from: incomingCall?.from, 
          to: userEmail, 
          purpose: incomingCall?.purpose || "Video Call", 
          id: incomingCall?.id || `call_${Date.now()}`
      };
      setSelectedAppointment(relatedAppointment);
      initializeVideoCall();
      if (incomingCall?.from) {
        setNotificationUtil(`${userEmail} accepted the call.`, incomingCall.from, false);
      }
    } else { 
      setCallStatus("");
      setShowCallModal(false);
      if (incomingCall?.from) {
        setNotificationUtil(`${userEmail} declined your call.`, incomingCall.from, false);
      }
    }

    if (callIdToProcess) {
        setProcessedCallNotificationIds(prev => new Set(prev).add(callIdToProcess));
    }
    setIncomingCall(null);
  }
  
  const handleEndCall = (notifyOtherParty = true) => {
    if (callStatus !== "ongoing" && callStatus !== "dialing") {
        if (showCallModal) cleanupCallResourcesAndCloseModal();
        return;
    }

    const previousCallStatus = callStatus; 
    previousCallStatusRef.current = previousCallStatus; 
    setCallStatus("ended");

    if (selectedAppointment && selectedAppointment.id && previousCallStatus === "ongoing") {
        updateAppointmentById(selectedAppointment.id, { status: "completed" });
        setAppointments(prevAppointments =>
            prevAppointments.map(app =>
                app.id === selectedAppointment.id ? { ...app, status: "completed" } : app
            )
        );
    }

    if (notifyOtherParty && selectedAppointment) {
      const recipient = selectedAppointment.from === userEmail ? selectedAppointment.to : selectedAppointment.from;
      if (recipient) {
          setNotificationUtil(`${userEmail} has left the call`, recipient, false);
      }
    }

    if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        remoteVideoRef.current.srcObject = null;
    }
    
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }

    setTimeout(() => {
        if (callStatus === "ended") { 
            cleanupCallResourcesAndCloseModal();
        }
    }, 1500);
  };
  
  const cleanupCallResourcesAndCloseModal = useCallback(() => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        remoteVideoRef.current.srcObject = null;
    }
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
    setShowCallModal(false);
    setSelectedAppointment(null);
    setIncomingCall(null);
    setCallSettings({ video: true, audio: true, screenShare: false });
    setCallDuration(0);
    setCallStatus("");   
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callTimer]);


  const toggleVideo = () => {
    const newVideoState = !callSettings.video;
    setCallSettings(prev => ({ ...prev, video: newVideoState }))
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks().forEach(t => t.enabled = newVideoState)
    }
    showNotification(newVideoState ? "Camera turned on" : "Camera turned off", "info")
  }

  const toggleAudio = () => {
    const newAudioState = !callSettings.audio;
    setCallSettings(prev => ({ ...prev, audio: newAudioState }))
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach(t => t.enabled = newAudioState)
    }
    showNotification(newAudioState ? "Microphone unmuted" : "Microphone muted", "info")
  }

  const toggleScreenShare = () => {
    const newScreenShareState = !callSettings.screenShare;
    setCallSettings(prev => ({ ...prev, screenShare: newScreenShareState }))
    showNotification(newScreenShareState ? "Screen sharing started (mock)" : "Screen sharing stopped (mock)", "info")
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0")
    const secs = (seconds % 60).toString().padStart(2, "0")
    return `${mins}:${secs}`
  }

  const initializeVideoCall = useCallback(() => {
    try {
        const setupStream = (videoRef, isLocal) => {
            if (!videoRef.current) return;
            if (videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }

            const canvas = document.createElement("canvas");
            canvas.width = 640; canvas.height = 480;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                showNotification(`Could not init ${isLocal ? "local" : "remote"} video context.`, "error");
                return;
            }
            let initialChar = "V";
            if (isLocal) {
                initialChar = userEmail ? userEmail.charAt(0).toUpperCase() : "L";
            } else {
                let remotePartyEmail = null;
                const currentCallStatus = callStatus; 
                if (currentCallStatus === "incoming" && incomingCall) remotePartyEmail = incomingCall.from;
                else if (selectedAppointment) remotePartyEmail = selectedAppointment.from === userEmail ? selectedAppointment.to : selectedAppointment.from;
                initialChar = remotePartyEmail ? remotePartyEmail.charAt(0).toUpperCase() : "R";
            }
            const bgColor = isLocal ? (isSCAD ? "#c5e8f7" : isFaculty ? "#d5c5f7" : "#f7d5c5")
                                    : (!isSCAD ? "#c5e8f7" : !isFaculty ? "#d5c5f7" : "#f7d5c5");
            
            let animationFrameId;
            const drawFrame = () => {
                const currentCallStatusForDraw = callStatus; 
                if (!ctx || (currentCallStatusForDraw !== "ongoing" && currentCallStatusForDraw !== "dialing" && currentCallStatusForDraw !== "incoming" && currentCallStatusForDraw !== "remote_ended_show_message")) {
                    if(videoRef.current && videoRef.current.srcObject){
                        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                        videoRef.current.srcObject = null;
                    }
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    return;
                }
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#4a4a6a";
                ctx.font = "120px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText(initialChar, canvas.width / 2, canvas.height / 2);
                ctx.font = "24px Arial";
                ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height - 50);
                animationFrameId = requestAnimationFrame(drawFrame);
            };
            drawFrame();

            if (typeof canvas.captureStream === 'function') {
                const stream = canvas.captureStream(30);
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error(`Error playing ${isLocal ? "local" : "remote"} video:`, e));
            } else {
                showNotification(`captureStream not supported for ${isLocal ? "local" : "remote"} video.`, "error");
            }
        };
        setupStream(localVideoRef, true);
        setupStream(remoteVideoRef, false);
    } catch (error) {
        console.error("Video call init error:", error);
        showNotification("Video call init failed.", "error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, callStatus, incomingCall, selectedAppointment, isSCAD, isFaculty]);


  const isUserOnline = (email) => {
    if (!email || typeof email !== 'string') return false;
    const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return hash % 3 !== 0 
  }

  const isAnyModalOpen = showRequestModal || showAppointmentModal || showCallModal || confirmLogout;

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh", fontFamily: "Arial, sans-serif", backgroundColor: "#f8f9fa", overflow: "hidden" }}>
      {isSCAD ? <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} /> : <SidebarStudent menuOpen={menuOpen} toggleMenu={toggleMenu} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", transition: "margin-left 0.3s ease", marginLeft: menuOpen ? "250px" : "0", filter: isAnyModalOpen ? "blur(4px)" : "none" }}>
        {/* Header JSX */}
        <div style={{ display: "flex", alignItems: "center", padding: "15px 20px", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", zIndex: 5, position: "sticky", top: 0, boxSizing: "border-box" }}>
           <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", width: "25px", height: "20px", cursor: "pointer", padding: "10px", borderRadius: "8px", transition: "background-color 0.2s", backgroundColor: menuOpen ? "rgba(181, 199, 248, 0.2)" : "transparent" }} onClick={toggleMenu} aria-label="Toggle menu" role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && toggleMenu()}>
            <div style={{ width: "25px", height: "3px", backgroundColor: "#4a4a6a", transition: "transform 0.3s ease, opacity 0.3s ease", transformOrigin: "center", transform: menuOpen ? "rotate(45deg) translate(0px, 8px)" : "none" }}></div>
            <div style={{ width: "25px", height: "3px", backgroundColor: "#4a4a6a", opacity: menuOpen ? 0 : 1, transition: "opacity 0.3s ease" }}></div>
            <div style={{ width: "25px", height: "3px", backgroundColor: "#4a4a6a", transition: "transform 0.3s ease, opacity 0.3s ease", transformOrigin: "center", transform: menuOpen ? "rotate(-45deg) translate(0px, -8px)" : "none" }}></div>
          </div>
          <h1 style={{ margin: "0 0 0 20px", fontSize: "20px", color: "#4a4a6a", fontWeight: "bold" }}>{isSCAD ? "SCAD Appointments" : isFaculty ? "Faculty Appointments" : "Student Appointments"}</h1>
          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px" }}><span style={{ color: "#6a6a8a", fontSize: "14px" }}>Home</span><span style={{ margin: "0 8px", color: "#6a6a8a" }}>/</span><span style={{ color: "#4a4a6a", fontSize: "14px", fontWeight: "bold" }}>Appointments</span></div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <div style={{ position: "relative", marginRight: "20px" }}>
              <div data-bell-icon="true" onClick={handleBellClick} style={{ cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "42px", height: "42px", borderRadius: "50%", backgroundColor: isPopupOpen ? "rgba(230, 230, 250, 0.5)" : "transparent", transition: "background-color 0.2s", animation: unreadNotifications.length > 0 ? "pulse 1.5s infinite ease-in-out" : "none" }} aria-label="Notifications" onMouseOver={(e) => { if (!isPopupOpen) e.currentTarget.style.backgroundColor = "rgba(230, 230, 250, 0.3)" }} onMouseOut={(e) => { if (!isPopupOpen) e.currentTarget.style.backgroundColor = "transparent" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#4a4a6a" }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                {unreadNotifications.length > 0 && (<span style={{ position: "absolute", top: "0", right: "0", backgroundColor: "#f44336", color: "white", borderRadius: "50%", width: "20px", height: "20px", fontSize: "11px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>{unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}</span>)}
              </div>
              {isPopupOpen && (
                <div 
                  ref={notificationRef} 
                  style={{ 
                    position: "absolute", 
                    top: "50px", 
                    right: "-10px", // You might want to adjust this if the width changes significantly
                    backgroundColor: "white", 
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)", 
                    borderRadius: "12px", 
                    width: "400px",  // ADJUSTED WIDTH
                    minWidth: "320px", 
                    maxWidth: "90vw",   
                    zIndex: 1001, 
                    border: "1px solid rgba(230,230,250,0.5)", 
                    overflow: "hidden" 
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: "1px solid rgba(230,230,250,0.7)", backgroundColor: "rgba(245,245,250,0.5)" }}>
                    <h4 style={{ margin: "0", color: "#4a4a6a", fontSize: "16px", fontWeight: "600" }}>Notifications</h4>
                    <button onClick={() => setIsPopupOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6a6a8a", padding: "5px", borderRadius: "50%", transition: "background-color 0.2s" }} aria-label="Close notifications" onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(230,230,250,0.5)")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                  </div>
                  <div style={{ maxHeight: "350px", overflowY: "auto", padding: "0" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "30px 20px", textAlign: "center", color: "#6a6a8a", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#d5c5f7", opacity: 0.7 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        <p style={{ margin: "0" }}>No new notifications</p>
                      </div>
                    ) : (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {notifications.map((n, index) => (
                          <li 
                            key={n.id || n.timestamp || index} 
                            style={{ 
                              padding: "12px 20px", 
                              borderBottom: index < notifications.length - 1 ? "1px solid rgba(230,230,250,0.4)" : "none", 
                              transition: "background-color 0.2s", 
                              cursor: "default" 
                            }} 
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(230,230,250,0.2)")} 
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <p 
                              style={{ 
                                margin: "0 0 5px 0", 
                                fontWeight: "500", 
                                color: "#4a4a6a", 
                                fontSize: "14px", 
                                lineHeight: "1.4",
                                wordBreak: "break-word", // Ensure text wraps
                                whiteSpace: "normal"     // Ensure text wraps
                              }}
                            >
                              {n.message}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#6a6a8a" }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              <span>{new Date(n.timestamp).toLocaleString()}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(230,230,250,0.7)", backgroundColor: "rgba(245,245,250,0.5)", textAlign: "center" }}>
                      <button onClick={handleClosePopup} style={{ backgroundColor: "#e0e0e0", color: "#555", border: "none", borderRadius: "6px", padding: "8px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "background-color 0.2s", width: "100%" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d0d0d0")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}>Clear all notifications</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: isSCAD ? "#c5e8f7" : isFaculty ? "#d5c5f7" : "#f7d5c5", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a4a6a", fontWeight: "bold", fontSize: "16px", marginRight: "10px" }}>{isSCAD ? "SA" : isFaculty ? "FP" : studentmail ? studentmail.substring(0, 2).toUpperCase() : "ST"}</div>
            <div style={{ marginRight: "20px" }}><div style={{ fontSize: "14px", fontWeight: "bold", color: "#4a4a6a" }}>{isSCAD ? "SCAD Admin" : isFaculty ? "Faculty User" : student.name || "Student User"}{studentrole === "pro" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "8px",
                        backgroundColor: "#ffd700",
                        color: "#4a4a6a",
                        fontSize: "10px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      PRO
                    </span>
                  )}
                </div><div style={{ fontSize: "12px", color: "#6a6a8a" }}>{userEmail || (isSCAD ? "Administrator" : isFaculty ? "Faculty" : "Student")}</div></div>
            <button onClick={handleLogout} style={{ padding: "8px 12px", backgroundColor: "rgba(255,200,200,0.5)", color: "#9a4a4a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", display: "flex", alignItems: "center", transition: "background-color 0.2s" }} onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(255,200,200,0.7)")} onMouseOut={(e) => (e.target.style.backgroundColor = "rgba(255,200,200,0.5)")} disabled={loading} aria-label="Logout">{loading ? "Please wait..." : "Logout"}</button>
          </div>
        </div>

        {/* Main Content JSX */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f8f9fa" }}>
          {loading && (<div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", zIndex: 10 }}><div style={{ width: "40px", height: "40px", margin: "0 auto 10px", border: "4px solid rgba(181,199,248,0.3)", borderRadius: "50%", borderTop: "4px solid #b5c7f8", animation: "spin 1s linear infinite" }}></div><div style={{ color: "#4a4a6a" }}>Loading...</div></div>)}
          {!loading && (<>
              <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}><h2 style={{ margin: "0 0 10px 0", color: "#4a4a6a", fontSize: "22px" }}>{isSCAD ? "SCAD Appointment Management" : isFaculty ? "Faculty Appointment Management" : "Student Appointment Management"}</h2><p style={{ margin: "0", color: "#6a6a8a", lineHeight: "1.5" }}>{isSCAD ? "Manage appointment requests, schedule video calls, and provide guidance to students." : isFaculty ? "Schedule appointments with students, clarify report requirements, and provide career guidance." : "Request appointments for career guidance or report clarifications, and manage your scheduled meetings."}</p></div>
              <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
                <button onClick={handleRequestAppointment} style={{ display: "flex", alignItems: "center", padding: "15px 25px", backgroundColor: isSCAD ? "#c5e8f7" : isFaculty ? "#d5c5f7" : "#f7d5c5", color: "#4a4a6a", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.2s ease-in-out" }} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)" }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)" }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M12 14v4"></path><path d="M10 16h4"></path></svg>Request {isStudent ? "Career Guidance" : "Report Clarification"}</button>
                <button onClick={handleViewAppointments} style={{ display: "flex", alignItems: "center", padding: "15px 25px", backgroundColor: "white", color: "#4a4a6a", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", transition: "all 0.2s ease-in-out" }} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor = "#bbb"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "#ddd"; }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>View Appointments</button>
              </div>
              <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#4a4a6a", fontSize: "18px" }}>Upcoming Appointments</h3>
                {appointments.filter((app) => app.status === "accepted").length === 0 ? (<div style={{ padding: "30px", textAlign: "center", color: "#6a6a8a", backgroundColor: "#f9f9fa", borderRadius: "6px" }}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#d5c5f7", opacity: 0.7, margin: "0 auto 15px", display: "block" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><p>No upcoming appointments scheduled.</p><button onClick={handleRequestAppointment} style={{ marginTop: "15px", padding: "8px 16px", backgroundColor: isSCAD ? "#c5e8f7" : isFaculty ? "#d5c5f7" : "#f7d5c5", color: "#4a4a6a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>Schedule New Appointment</button></div>
                ) : (<div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "600px" }}>
                      <thead><tr><th style={{ textAlign: "left", padding: "12px 15px", borderBottom: "1px solid #eee", color: "#4a4a6a", backgroundColor: "#f9f9fa" }}>Purpose</th><th style={{ textAlign: "left", padding: "12px 15px", borderBottom: "1px solid #eee", color: "#4a4a6a", backgroundColor: "#f9f9fa" }}>With</th><th style={{ textAlign: "left", padding: "12px 15px", borderBottom: "1px solid #eee", color: "#4a4a6a", backgroundColor: "#f9f9fa" }}>Status</th><th style={{ textAlign: "left", padding: "12px 15px", borderBottom: "1px solid #eee", color: "#4a4a6a", backgroundColor: "#f9f9fa" }}>Actions</th></tr></thead>
                      <tbody>{appointments.filter((app) => app.status === "accepted").map((appointment, index) => {
                          const otherParty = appointment.from === userEmail ? appointment.to : appointment.from;
                          const isOtherPartyOnline = isUserOnline(otherParty);
                          return (<tr key={appointment.id || index} style={{ backgroundColor: index % 2 === 0 ? "white" : "#fdfdfd" }}>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee", color: "#6a6a8a" }}>{appointment.purpose}</td>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee", color: "#6a6a8a" }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}>{otherParty}</div></td>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee" }}><span style={{ display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", backgroundColor: "rgba(76,175,80,0.1)", color: "#4CAF50" }}>Confirmed</span></td>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "10px" }}>
                                <button onClick={() => handleStartCall(appointment)} style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", backgroundColor: isOtherPartyOnline ? "#4CAF50" : "#9e9e9e", color: "white", border: "none", borderRadius: "4px", cursor: isOtherPartyOnline ? "pointer" : "not-allowed", fontSize: "12px", opacity: isOtherPartyOnline ? 1 : 0.7 }} disabled={!isOtherPartyOnline} title={isOtherPartyOnline ? "Start Video Call" : "User is offline"}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "5px" }}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>Start Call</button>
                                <span style={{ display: "inline-flex", alignItems: "center", fontSize: "12px", color: isOtherPartyOnline ? "#4CAF50" : "#757575" }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOtherPartyOnline ? '#4CAF50' : '#9e9e9e', marginRight: '5px' }}></span>
                                    {isOtherPartyOnline ? "Online" : "Offline"}
                                </span>
                              </td>
                            </tr>);})}
                      </tbody></table></div>)}
              </div>
              <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#4a4a6a", fontSize: "18px" }}>Pending Requests</h3>
                {appointments.filter((app) => app.status === "pending").length === 0 ? (<div style={{ padding: "30px", textAlign: "center", color: "#6a6a8a", backgroundColor: "#f9f9fa", borderRadius: "6px" }}><p>No pending appointment requests.</p></div>
                ) : (<div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "600px" }}>
                      <thead><tr><th style={{ textAlign: "left", padding: "12px 15px", borderBottom: "1px solid #eee", color: "#4a4a6a", backgroundColor: "#f9f9fa" }}>Purpose</th><th style={{ textAlign: "left", padding: "12px 15px", borderBottom: "1px solid #eee", color: "#4a4a6a", backgroundColor: "#f9f9fa" }}>From/To</th><th style={{ textAlign: "left", padding: "12px 15px", borderBottom: "1px solid #eee", color: "#4a4a6a", backgroundColor: "#f9f9fa" }}>Message</th><th style={{ textAlign: "left", padding: "12px 15px", borderBottom: "1px solid #eee", color: "#4a4a6a", backgroundColor: "#f9f9fa" }}>Actions</th></tr></thead>
                      <tbody>{appointments.filter((app) => app.status === "pending").map((appointment, index) => {
                          const isIncoming = appointment.to === userEmail;
                          return (<tr key={appointment.id || index} style={{ backgroundColor: index % 2 === 0 ? "white" : "#fdfdfd" }}>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee", color: "#6a6a8a" }}>{appointment.purpose}</td>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee", color: "#6a6a8a" }}>{isIncoming ? `From: ${appointment.from}` : `To: ${appointment.to}`}</td>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee", color: "#6a6a8a", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={appointment.message || "No message"}>{appointment.message || "No message"}</td>
                              <td style={{ padding: "12px 15px", borderBottom: "1px solid #eee", display: "flex", gap: "8px", alignItems: "center" }}>{isIncoming ? (<><button onClick={() => handleAppointmentAction(appointment, "accepted")} style={{ padding: "6px 12px", backgroundColor: "rgba(76,175,80,0.1)", color: "#4CAF50", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Accept</button><button onClick={() => handleAppointmentAction(appointment, "rejected")} style={{ padding: "6px 12px", backgroundColor: "rgba(244,67,54,0.1)", color: "#F44336", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Reject</button></>) : (<span style={{ display: "inline-block", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", backgroundColor: "rgba(255,152,0,0.1)", color: "#FF9800" }}>Awaiting Response</span>)}</td>
                            </tr>);})}
                      </tbody></table></div>)}
              </div></>)}
        </div>
      </div>

      {/* Request Appointment Modal */}
      {showRequestModal && (<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}><div style={{ backgroundColor: "white", borderRadius: "8px", padding: "25px", width: "500px", maxWidth: "90%", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}><h3 style={{ margin: "0 0 20px 0", color: "#4a4a6a", fontSize: "18px" }}>Request Appointment</h3><div style={{ marginBottom: "15px" }}><label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#6a6a8a", fontWeight: "bold" }}>Purpose*</label><div style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", color: "#4a4a6a", backgroundColor: "#f9f9fa" }}>{appointmentDetails.purpose || (isStudent ? "Career Guidance" : "Report Clarification")}</div></div>{isSCAD && (<div style={{ marginBottom: "15px" }}><label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#6a6a8a", fontWeight: "bold" }}>Student Email*</label>{studentEmails.length > 0 ? (<select value={appointmentDetails.recipient} onChange={(e) => setAppointmentDetails({ ...appointmentDetails, recipient: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", color: "#4a4a6a", boxSizing: "border-box", backgroundColor: "white" }} required>{studentEmails.map((email, index) => (<option key={index} value={email}>{email}</option>))}</select>) : (<div style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", color: "#9a4a4a", backgroundColor: "#fff8f8" }}>No student emails found.</div>)}</div>)}<div style={{ marginBottom: "15px" }}><label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#6a6a8a", fontWeight: "bold" }}>Message (Optional)</label><textarea placeholder="Add additional details..." value={appointmentDetails.message} onChange={(e) => setAppointmentDetails({ ...appointmentDetails, message: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", color: "#4a4a6a", minHeight: "100px", resize: "vertical", boxSizing: "border-box", backgroundColor: "white" }} /></div><div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}><button onClick={() => setShowRequestModal(false)} style={{ padding: "10px 15px", backgroundColor: "#f1f1f1", color: "#6a6a8a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>Cancel</button><button onClick={handleAppointmentSubmit} style={{ padding: "10px 20px", backgroundColor: isSCAD ? "#c5e8f7" : isFaculty ? "#d5c5f7" : "#f7d5c5", color: "#4a4a6a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>Submit Request</button></div></div></div>)}
      
      {/* View Appointments Modal */}
      {showAppointmentModal && (<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}><div style={{ backgroundColor: "white", borderRadius: "8px", padding: "25px", width: "800px", maxWidth: "90%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}><h3 style={{ margin: "0 0 20px 0", color: "#4a4a6a", fontSize: "18px" }}>All Appointments</h3><div style={{ marginBottom: "30px" }}><h4 style={{ margin: "0 0 15px 0", color: "#4a4a6a", fontSize: "16px", paddingBottom: "10px", borderBottom: "1px solid #eee" }}>My Sent Requests</h4>{appointments.filter((app) => app.from === userEmail).length === 0 ? (<div style={{ padding: "20px", textAlign: "center", color: "#6a6a8a", backgroundColor: "#f9f9fa", borderRadius: "6px" }}><p>You haven't sent any appointment requests.</p><button onClick={() => { setShowAppointmentModal(false); setTimeout(() => handleRequestAppointment(), 100); }} style={{ marginTop: "15px", padding: "8px 16px", backgroundColor: isSCAD ? "#c5e8f7" : isFaculty ? "#d5c5f7" : "#f7d5c5", color: "#4a4a6a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>Create New Request</button></div>) : (<div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "700px" }}><thead><tr><th style={{textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #eee", color:"#4a4a6a", backgroundColor:"#f9f9fa"}}>Purpose</th><th style={{textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #eee", color:"#4a4a6a", backgroundColor:"#f9f9fa"}}>To</th><th style={{textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #eee", color:"#4a4a6a", backgroundColor:"#f9f9fa"}}>Status</th><th style={{textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #eee", color:"#4a4a6a", backgroundColor:"#f9f9fa"}}>Actions</th></tr></thead><tbody>{appointments.filter((app) => app.from === userEmail).map((appointment, index) => { const isOtherPartyOnline = isUserOnline(appointment.to); return (<tr key={appointment.id || index} style={{backgroundColor: index % 2 === 0 ? "white" : "#fdfdfd"}}><td style={{padding:"10px 12px", borderBottom:"1px solid #eee", color:"#6a6a8a"}}>{appointment.purpose}</td><td style={{padding:"10px 12px", borderBottom:"1px solid #eee", color:"#6a6a8a"}}>{appointment.to}</td><td style={{padding:"10px 12px", borderBottom:"1px solid #eee"}}><span style={{display:"inline-block", padding:"4px 8px", borderRadius:"4px", fontSize:"12px", fontWeight:"bold", backgroundColor: appointment.status === "accepted" ? "rgba(76,175,80,0.1)" : appointment.status === "rejected" ? "rgba(244,67,54,0.1)" : appointment.status === "completed" ? "rgba(158,158,158,0.1)" : "rgba(255,152,0,0.1)", color: appointment.status === "accepted" ? "#4CAF50" : appointment.status === "rejected" ? "#F44336" : appointment.status === "completed" ? "#616161" : "#FF9800" }}>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span></td>
                                <td style={{padding:"10px 12px", borderBottom:"1px solid #eee", display: "flex", alignItems: "center", gap: "10px"}}>
                                  {appointment.status === "accepted" && (<>
                                    <button onClick={() => { setShowAppointmentModal(false); setTimeout(() => handleStartCall(appointment), 100); }} style={{ display:"inline-flex", alignItems:"center", padding:"6px 10px", backgroundColor: isOtherPartyOnline ? "#4CAF50":"#9e9e9e", color:"white", border:"none", borderRadius:"4px", cursor: isOtherPartyOnline ? "pointer":"not-allowed", fontSize:"12px", opacity: isOtherPartyOnline ? 1:0.7}} disabled={!isOtherPartyOnline} title={isOtherPartyOnline ? "Start Video Call":"User is offline"}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:"5px"}}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>Call</button>
                                    <span style={{ display: "inline-flex", alignItems: "center", fontSize: "12px", color: isOtherPartyOnline ? "#4CAF50" : "#757575" }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOtherPartyOnline ? '#4CAF50' : '#9e9e9e', marginRight: '5px' }}></span>
                                        {isOtherPartyOnline ? "Online" : "Offline"}
                                    </span>
                                  </>)}
                                </td></tr>);})}</tbody></table></div>)}</div>
            <div><h4 style={{ margin: "0 0 15px 0", color: "#4a4a6a", fontSize: "16px", paddingBottom: "10px", borderBottom: "1px solid #eee" }}>Received Requests</h4>{appointments.filter((app) => app.to === userEmail).length === 0 ? (<div style={{ padding: "20px", textAlign: "center", color: "#6a6a8a", backgroundColor: "#f9f9fa", borderRadius: "6px" }}><p>You haven't received any appointment requests.</p></div>) : (<div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", minWidth: "700px" }}><thead><tr><th style={{textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #eee", color:"#4a4a6a", backgroundColor:"#f9f9fa"}}>Purpose</th><th style={{textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #eee", color:"#4a4a6a", backgroundColor:"#f9f9fa"}}>From</th><th style={{textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #eee", color:"#4a4a6a", backgroundColor:"#f9f9fa"}}>Status</th><th style={{textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #eee", color:"#4a4a6a", backgroundColor:"#f9f9fa"}}>Actions</th></tr></thead><tbody>{appointments.filter((app) => app.to === userEmail).map((appointment, index) => { const isOtherPartyOnline = isUserOnline(appointment.from); return (<tr key={appointment.id || index} style={{backgroundColor: index % 2 === 0 ? "white" : "#fdfdfd"}}><td style={{padding:"10px 12px", borderBottom:"1px solid #eee", color:"#6a6a8a"}}>{appointment.purpose}</td><td style={{padding:"10px 12px", borderBottom:"1px solid #eee", color:"#6a6a8a"}}>{appointment.from}</td><td style={{padding:"10px 12px", borderBottom:"1px solid #eee"}}><span style={{display:"inline-block", padding:"4px 8px", borderRadius:"4px", fontSize:"12px", fontWeight:"bold", backgroundColor: appointment.status === "accepted" ? "rgba(76,175,80,0.1)" : appointment.status === "rejected" ? "rgba(244,67,54,0.1)" : appointment.status === "completed" ? "rgba(158,158,158,0.1)" : "rgba(255,152,0,0.1)", color: appointment.status === "accepted" ? "#4CAF50" : appointment.status === "rejected" ? "#F44336" : appointment.status === "completed" ? "#616161" : "#FF9800" }}>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span></td>
                                <td style={{padding:"10px 12px", borderBottom:"1px solid #eee"}}>
                                  {appointment.status === "accepted" && (<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <button onClick={() => { setShowAppointmentModal(false); setTimeout(() => handleStartCall(appointment), 100); }} style={{ display:"inline-flex", alignItems:"center", padding:"6px 10px", backgroundColor: isOtherPartyOnline ? "#4CAF50":"#9e9e9e", color:"white", border:"none", borderRadius:"4px", cursor: isOtherPartyOnline ? "pointer":"not-allowed", fontSize:"12px", opacity: isOtherPartyOnline ? 1:0.7 }} disabled={!isOtherPartyOnline} title={isOtherPartyOnline ? "Start Video Call":"User is offline"}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:"5px"}}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>Call</button>
                                    <span style={{ display: "inline-flex", alignItems: "center", fontSize: "12px", color: isOtherPartyOnline ? "#4CAF50" : "#757575" }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOtherPartyOnline ? '#4CAF50' : '#9e9e9e', marginRight: '5px' }}></span>
                                        {isOtherPartyOnline ? "Online" : "Offline"}
                                    </span>
                                  </div>)}
                                  {appointment.status === "pending" && (<div style={{ display: "flex", gap: "8px" }}><button onClick={() => handleAppointmentAction(appointment, "accepted")} style={{ padding: "6px 10px", backgroundColor: "rgba(76,175,80,0.1)", color: "#4CAF50", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Accept</button><button onClick={() => handleAppointmentAction(appointment, "rejected")} style={{ padding: "6px 10px", backgroundColor: "rgba(244,67,54,0.1)", color: "#F44336", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Reject</button></div>)}
                                </td></tr>);})}</tbody></table></div>)}</div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "25px" }}><button onClick={() => setShowAppointmentModal(false)} style={{ padding: "10px 20px", backgroundColor: "#f1f1f1", color: "#6a6a8a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>Close</button></div></div></div>)}

      {/* Call Modal */}
      {showCallModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", width: "90%", maxWidth: "1000px", height: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            {(() => { 
              let otherPartyName = "Participant";
              if (callStatus === "incoming" && incomingCall) {
                  otherPartyName = incomingCall.from;
              } else if (selectedAppointment) { 
                  otherPartyName = selectedAppointment.from === userEmail ? selectedAppointment.to : selectedAppointment.from;
              }

              let headerTitle = "Video Call";
              let headerStatusText = null;

              if (callStatus === "incoming") {
                headerTitle = "Incoming Call";
              } else if (callStatus === "dialing") {
                headerTitle = "Calling...";
                headerStatusText = <span style={{ fontSize: "14px", color: "#FFA500" }}>Connecting...</span>;
              } else if (callStatus === "ongoing") {
                headerTitle = "Ongoing Call";
                headerStatusText = <span style={{ display: "inline-flex", alignItems: "center", fontSize: "14px", color: "#4CAF50" }}><span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4CAF50", marginRight: "8px" }}></span>Connected • {formatDuration(callDuration)}</span>;
              } else if (callStatus === "ended" || callStatus === "remote_ended_show_message") {
                headerTitle = "Call Ended";
                let durationText = "";
                if (callDuration > 0) {
                    durationText = `• ${formatDuration(callDuration)}`;
                } else if (previousCallStatusRef.current === "dialing" && (callStatus === "remote_ended_show_message" || callStatus === "ended")) {
                    durationText = "";
                }
                headerStatusText = <span style={{ fontSize: "14px", color: "#F44336" }}>Call Ended {durationText}</span>;
              }
              
              return (
                <>
                  <div style={{ padding: "15px 20px", backgroundColor: "#2a2a2a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px" }}>{headerTitle}</h3>
                      <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.7 }}>
                        {callStatus === "incoming" ? `From: ${otherPartyName}` : 
                         (callStatus === "dialing" || callStatus === "ongoing" || callStatus === "remote_ended_show_message") ? `With: ${otherPartyName}` : 
                         callStatus === "ended" ? `Call with ${otherPartyName} ended.` : ""}
                      </p>
                    </div>
                    <div>{headerStatusText}</div>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", backgroundColor: "#121212" }}>
                    {callStatus === "incoming" ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px", textAlign: "center", color: "white" }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#4a4a6a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>{otherPartyName?.charAt(0).toUpperCase() || "?"}</div>
                        <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>Incoming call from {otherPartyName}</h2>
                        <p style={{ margin: "0 0 30px 0", opacity: 0.7 }}>{selectedAppointment?.purpose || incomingCall?.purpose || "Video Call"}</p>
                        <div style={{ display: "flex", gap: "20px" }}>
                          <button onClick={() => handleIncomingCall(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#F44336", border: "none", cursor: "pointer", color: "white" }} title="Decline call"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                          <button onClick={() => handleIncomingCall(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#4CAF50", border: "none", cursor: "pointer", color: "white" }} title="Accept call"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></button>
                        </div>
                      </div>
                    ) : callStatus === "dialing" ? (
                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px", textAlign: "center", color: "white" }}>
                          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#4a4a6a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>{otherPartyName?.charAt(0).toUpperCase() || "?"}</div>
                          <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>Calling {otherPartyName}...</h2>
                          <p style={{ margin: "0 0 30px 0", opacity: 0.7 }}>Please wait while we connect you.</p>
                           <div style={{ width: "40px", height: "40px", margin: "20px auto", border: "4px solid rgba(255,255,255,0.3)", borderRadius: "50%", borderTop: "4px solid #fff", animation: "spin 1s linear infinite" }}></div>
                          <div style={{ position:"absolute", bottom: "15px", display: "flex", justifyContent: "center", alignItems: "center", padding: "15px", backgroundColor: "transparent", gap: "20px", width: "100%" }}>
                              <button onClick={() => handleEndCall(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "70px", height: "60px", borderRadius: "30px", backgroundColor: "#F44336", border: "none", cursor: "pointer", color: "white", padding: "10px" }} title="Cancel call">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                              </button>
                          </div>
                      </div>
                    ) : callStatus === "ongoing" ? (
                      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative", backgroundColor: "#121212", overflow: "hidden" }}>
                          <video ref={remoteVideoRef} autoPlay playsInline style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", backgroundColor: "#202020" }}/>
                          <div style={{ position: "absolute", bottom: "15px", right: "15px", width: "25%", maxWidth: "180px", aspectRatio: "4 / 3", borderRadius: "8px", overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)", boxShadow: "0 2px 5px rgba(0,0,0,0.3)", display: callSettings.video ? "block" : "none", backgroundColor: "#202020" }}>
                            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                          </div>
                          {callSettings.screenShare && (<div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "5px 10px", borderRadius: "4px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>You are sharing your screen</div>)}
                          {!callSettings.video && (<div style={{ position: "absolute", bottom: "15px", right: "15px", backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "5px 10px", borderRadius: "4px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>Camera Off</div>)}
                          {!callSettings.audio && (<div style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.7)", color: "white", padding: "5px 10px", borderRadius: "4px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>Muted</div>)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "15px", backgroundColor: "#2a2a2a", gap: "20px", flexShrink: 0 }}>
                          <button onClick={toggleVideo} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: callSettings.video ? "#4a4a6a" : "#F44336", border: "none", cursor: "pointer", color: "white", padding: "10px" }} title={callSettings.video ? "Turn off camera" : "Turn on camera"}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{callSettings.video ? (<><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></>) : (<><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></>)}</svg></button>
                          <button onClick={toggleAudio} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: callSettings.audio ? "#4a4a6a" : "#F44336", border: "none", cursor: "pointer", color: "white", padding: "10px" }} title={callSettings.audio ? "Mute microphone" : "Unmute microphone"}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{callSettings.audio ? (<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></>) : (<><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></>)}</svg></button>
                          <button onClick={toggleScreenShare} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "50%", backgroundColor: callSettings.screenShare ? "#4CAF50" : "#4a4a6a", border: "none", cursor: "pointer", color: "white", padding: "10px" }} title={callSettings.screenShare ? "Stop sharing screen" : "Share screen"}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg></button>
                          <button onClick={() => handleEndCall(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "70px", height: "60px", borderRadius: "30px", backgroundColor: "#F44336", border: "none", cursor: "pointer", color: "white", padding: "10px", marginLeft: "20px" }} title="End call"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg></button>
                        </div>
                      </div>
                    ) : callStatus === "remote_ended_show_message" ? (
                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px", textAlign: "center", color: "white" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={"#F44336"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "20px" }}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                          <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>Call Ended</h2>
                          <p style={{ margin: "0 0 10px 0", opacity: 0.7 }}>{otherPartyName} has left the call.</p>
                          {(callDuration > 0 || previousCallStatusRef.current === "ongoing") && <p style={{ margin: "0 0 30px 0", opacity: 0.7, fontSize: "14px" }}>Duration: {formatDuration(callDuration)}</p>}
                          <button onClick={cleanupCallResourcesAndCloseModal} style={{ padding: "10px 20px", backgroundColor: "#4a4a6a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px" }}>Close</button>
                        </div>
                    ) : ( 
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px", textAlign: "center", color: "white" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={callStatus === "ended" ? "#F44336" : "currentColor"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "20px" }}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                        <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>{callStatus === "ended" ? "Call Ended" : "Call Disconnected"}</h2>
                        <p style={{ margin: "0 0 30px 0", opacity: 0.7 }}>
                            {callStatus === "ended" 
                                ? `Your call with ${otherPartyName} has ended. ${(callDuration > 0 || previousCallStatusRef.current === "ongoing") ? `Duration: ${formatDuration(callDuration)}` : ''}` 
                                : "An issue occurred with the call."}
                        </p>
                        <button onClick={cleanupCallResourcesAndCloseModal} style={{ padding: "10px 20px", backgroundColor: "#4a4a6a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px" }}>Close</button>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Notification Toasts */}
      {notificationState.show && (<div style={{ position: "fixed", bottom: "20px", right: "20px", backgroundColor: notificationState.type === "success" ? "rgba(76,175,80,0.95)" : notificationState.type === "error" ? "rgba(244,67,54,0.95)" : "rgba(33,150,243,0.95)", color: "white", padding: "12px 20px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 2000, maxWidth: "320px", animation: "fadeIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards", display: 'flex', alignItems: 'center', gap: '10px' }}>{notificationState.type === "success" && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}{notificationState.type === "error" && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>}{notificationState.type === "info" && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}{notificationState.message}</div>)}
      
      {/* Confirm Logout Modal */}
      {confirmLogout && (<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}><div style={{ backgroundColor: "white", borderRadius: "8px", padding: "25px", width: "320px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}><h3 style={{ margin: "0 0 15px 0", color: "#4a4a6a", fontSize: "18px" }}>Confirm Logout</h3><p style={{ margin: "0 0 20px 0", color: "#6a6a8a" }}>Are you sure you want to log out?</p><div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}><button onClick={() => confirmLogoutAction(false)} style={{ padding: "8px 16px", backgroundColor: "#f1f1f1", color: "#6a6a8a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}>Cancel</button><button onClick={() => confirmLogoutAction(true)} style={{ padding: "8px 16px", backgroundColor: "rgba(255,200,200,0.7)", color: "#9a4a4a", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>Logout</button></div></div></div>)}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(20px)}}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@keyframes pulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(181,199,248,.7)}70%{transform:scale(1.1);box-shadow:0 0 0 10px rgba(181,199,248,0)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(181,199,248,0)}}div::-webkit-scrollbar{width:8px;height:8px}div::-webkit-scrollbar-track{background:#f1f1f1;border-radius:10px}div::-webkit-scrollbar-thumb{background:#c5c5c5;border-radius:10px}div::-webkit-scrollbar-thumb:hover{background:#a5a5a5}`}</style>
    </div>
  )
}
export default AppointmentPage;