import React from "react";
import { User, Bot } from "lucide-react";

type ChatMessageProps = {
  role: "user" | "assistant" | number; // Support both string and number
  content: string;
  timestamp?: Date | string;
  isStreaming?: boolean;
};

// Simple content formatter for basic markdown-like formatting
const formatContent = (content: string): string => {
  return content
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert ### headers to h3
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Convert ## headers to h2
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    // Convert # headers to h1
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Convert > blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Convert `code` to <code>
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Convert line breaks to <br> for better formatting
    .replace(/\n/g, '<br>')
    // Convert numbered lists (1. item)
    .replace(/^(\d+)\. (.*$)/gm, '<ol><li>$2</li></ol>')
    // Convert bullet lists (- item or * item)
    .replace(/^[-*] (.*$)/gm, '<ul><li>$1</li></ul>')
    // Clean up consecutive list tags
    .replace(/<\/ol>\s*<ol>/g, '')
    .replace(/<\/ul>\s*<ul>/g, '');
};



// Streaming indicator component
const StreamingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 mt-2">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
    <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, timestamp, isStreaming = false }) => {
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
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-sm"
          }`}>
            {messageRole === "user" ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>
        
        {/* Message content */}
        <div className="flex flex-col">
          <div className={`rounded-lg px-4 py-3 ${
            messageRole === "user"
              ? "bg-blue-600 text-white"
              : "bg-gray-50 text-gray-900"
          }`}>
            {messageRole === "user" ? (
              <div className="whitespace-pre-wrap break-words">{content}</div>
            ) : (
              <>
                <div
                  className="prose prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:text-gray-700 prose-code:text-pink-600 prose-code:bg-gray-100 prose-pre:bg-gray-100"
                  dangerouslySetInnerHTML={{ __html: formatContent(content) }}
                />
                {isStreaming && <StreamingIndicator />}
              </>
            )}
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