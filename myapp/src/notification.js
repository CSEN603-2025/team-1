// This file contains functions for handling notifications

// Function to get notifications for a user
export const getNotification = (email) => {
  try {
    const data = localStorage.getItem("notifications");
    // console.log("Raw notifications data:", data); // For debugging
    if (!data) return [];
    let allNotifications = JSON.parse(data);

    // Filter notifications for the given email
    const userNotifications = allNotifications.filter((n) => n.email === email);
    // console.log(`Notifications for ${email}:`, userNotifications); // For debugging

    // This logic removes notifications that were meant to be cleared after being fetched once.
    // This might be why notifications disappear if you are expecting them to persist until explicitly cleared by the user.
    // Consider if 'clearAfterRead' functionality is truly what you want for all notifications.
    const notificationsToKeep = allNotifications.filter((n) => {
        // Keep if not for this user OR if it is for this user BUT NOT clearAfterRead
        return n.email !== email || (n.email === email && !n.clearAfterRead);
    });

    if (notificationsToKeep.length < allNotifications.length) {
        localStorage.setItem("notifications", JSON.stringify(notificationsToKeep));
    }
    
    return userNotifications.map(n => ({...n, id: n.id || n.timestamp})); // Ensure ID exists
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
};

// Function to set a notification for a user
export const setNotification = (message, email, clearAfterRead = false) => {
  try {
    const newNotification = {
      id: Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9), // *** ADDED UNIQUE ID ***
      message,
      email,
      timestamp: new Date().toISOString(),
      clearAfterRead,
      // isRead: false, // Optional: to track read status directly on the object
    };

    const existingData = localStorage.getItem("notifications");
    const notifications = existingData ? JSON.parse(existingData) : [];
    notifications.push(newNotification);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    return true;
  } catch (error) {
    console.error("Error setting notification:", error);
    return false;
  }
};

// Function to clear all notifications for a user
export const clearNotifications = (email = null) => {
  try {
    if (!email) {
      localStorage.removeItem("notifications");
    } else {
      const data = localStorage.getItem("notifications");
      if (!data) return true; // Nothing to clear

      const notifications = JSON.parse(data);
      const remaining = notifications.filter((n) => n.email !== email);
      localStorage.setItem("notifications", JSON.stringify(remaining));
    }
    return true;
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return false;
  }
};

// Function to mark notifications as read (concept, if needed for more complex read states)
// The current AppointmentPage uses its own 'viewedNotifications' array for the bell icon.
export const markNotificationsAsRead = (userEmail, notificationIds = []) => {
  try {
    const data = localStorage.getItem("notifications");
    if (!data) return false;

    let notifications = JSON.parse(data);
    if (notificationIds.length > 0) {
      notifications = notifications.map((notification) => {
        if (notification.email === userEmail && notificationIds.includes(notification.id)) {
          // You might add an 'isRead: true' property to the notification object itself
          // For now, this function might not be directly used by AppointmentPage's bell logic
          // which relies on a separate 'viewedNotifications' list.
          return { ...notification, isReadBySystem: true }; // Example property
        }
        return notification;
      });
    }
    localStorage.setItem("notifications", JSON.stringify(notifications));
    return true;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return false;
  }
};