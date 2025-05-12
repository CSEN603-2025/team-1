// src/notificationUtils.js

export function setNotification(message, email, clearAfterRead = false) {
  const notificationData = {
    message,
    email,
    timestamp: new Date().toISOString(),
    clearAfterRead,  // Optionally set to clear after being read
  };

  localStorage.setItem('notification', JSON.stringify(notificationData));
}

export function getNotification(email) {
  const data = localStorage.getItem('notification');
  
  // If no notification exists in localStorage, return an empty array instead of null
  if (!data) {
    return ['no notification'];
  }
  
  const notificationData = JSON.parse(data);

  // Check if the email from the notification matches the given email
  if (notificationData.email === email) {
    // If 'clearAfterRead' is true, remove the notification from localStorage after reading it
    if (notificationData.clearAfterRead) {
      localStorage.removeItem('notification');
    }

    // Return the notifications in an array form
    return [notificationData];  // Wrap the notificationData in an array to match the expected format
  } else {
    return [];  // Email doesn't match, return empty array
  }
};


export function clearNotification() {
  localStorage.removeItem('notification');
}
