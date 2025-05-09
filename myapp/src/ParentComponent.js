// src/components/ParentComponent.js
import React, { useState } from 'react';
import ViewRegistration from './viewregistration'; // Import the ViewRegistration component

function ParentComponent() {
  // Manage the notification message state
  const [notificationMessage, setNotificationMessage] = useState('');

  return (
    <div>
      <h1>Parent Component</h1>
      
      {/* Pass the setNotificationMessage to the child component */}
      <ViewRegistration setNotificationMessage={setNotificationMessage} />
      
      {/* Display the notification message */}
      <div style={{ marginTop: '20px', color: 'green' }}>
        {notificationMessage}
      </div>
    </div>
  );
}

export default ParentComponent;
