// src/notificationUtils.js

// Add a new notification to the list
export function setNotification(message, email, clearAfterRead = false) {
  const newNotification = {
    message,
    email,
    timestamp: new Date().toISOString(),
    clearAfterRead,
  };

  // Get existing notifications
  const existingData = localStorage.getItem('notifications');
  const notifications = existingData ? JSON.parse(existingData) : [];

  // Add new notification to the array
  notifications.push(newNotification);

  // Save updated array back to localStorage
  localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Get all notifications for a specific email
export function getNotification(email) {
    const data = localStorage.getItem('notifications');
    console.log(data);
    const user= JSON.parse(localStorage.getItem('allUsers')) ;
    console.log(user);
    if (!data) return [];
    let notifications = JSON.parse(data);

    // Filter notifications for the given email
    const userNotifications = notifications.filter(n => n.email === email);
    console.log(userNotifications);

    // Remove those marked as 'clearAfterRead'
    notifications = notifications.filter(n => !(n.email === email && n.clearAfterRead));

    // Update localStorage (if any were cleared)
    localStorage.setItem('notifications', JSON.stringify(notifications));

    return userNotifications;
}

// Clear all notifications for a specific email (optional)
export function clearNotifications(email = null) {
  if (!email) {
    // Remove all notifications
    localStorage.removeItem('notifications');
  } else {
    const data = localStorage.getItem('notifications');
    if (!data) return;

    const notifications = JSON.parse(data);
    const remaining = notifications.filter(n => n.email !== email);
    localStorage.setItem('notifications', JSON.stringify(remaining));
  }
}
