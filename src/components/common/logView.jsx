// Log.js

import React from 'react';

// Log component to display messages
const Log = ({ messages, isDarkMode }) => {
  return (
    <div className={`h-40 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'} overflow-y-auto`}>
      {messages.map((msg, index) => (
        <div key={index} className="p-2 border-b last:border-b-0">
          {msg}
        </div>
      ))}
    </div>
  );
};

export default Log;
