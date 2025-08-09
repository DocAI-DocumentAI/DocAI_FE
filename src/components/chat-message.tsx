import React from "react";
import { User, Bot } from "lucide-react";

type ChatMessageProps = {
  role: "user" | "assistant" | number; // Support both string and number
  content: string;
  timestamp?: Date | string;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, timestamp }) => {
  // Convert role to string if it's a number (from API)
  const messageRole = typeof role === 'number' 
    ? (role === 1 ? 'user' : 'assistant')
    : role;

  // Format timestamp
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className={`mb-6 flex ${messageRole === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] ${messageRole === "user" ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${messageRole === "user" ? "ml-3" : "mr-3"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            messageRole === "user" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-600"
          }`}>
            {messageRole === "user" ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>
        
        {/* Message content */}
        <div className="flex flex-col">
          <div className={`rounded-lg px-4 py-3 ${
            messageRole === "user"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}>
            <div className="whitespace-pre-wrap break-words">{content}</div>
          </div>
          
          {/* Timestamp */}
          {timestamp && (
            <div className={`text-xs text-gray-500 mt-1 ${
              messageRole === "user" ? "text-right" : "text-left"
            }`}>
              {formatTime(timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;