import React from 'react';

const ChatMessage = ({ message, isCurrentUser, senderName, timestamp }) => {
  return (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-4`}>
      <div 
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'
        }`}
      >
        {message}
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {senderName} • {new Date(timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
};

export default ChatMessage;
