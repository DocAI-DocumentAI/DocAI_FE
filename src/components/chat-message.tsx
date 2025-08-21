import React from "react";
import { User, Bot, FileText, Calendar, Tag } from "lucide-react";

export interface DocumentSource {
  documentId: string;
  title: string;
  versionId: string;
  versionName: string;
  departmentId: string;
  description: string | null;
  tags: string[] | null;
  effectiveFrom: string;
  effectiveUntil: string;
  relevanceScore: number;
  summary: string;
  approvalDate: string | null;
}

type ChatMessageProps = {
  role: "user" | "assistant" | number;
  content: string;
  timestamp?: Date | string;
  isStreaming?: boolean;
  documentSources?: DocumentSource[];
  hasDocumentContext?: boolean;
};

// Function to convert URLs to clickable links
const renderContentWithLinks = (content: string): string => {
  // Enhanced regex to match complete URLs including paths, parameters, and fragments
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
  
  return content.replace(urlRegex, (url) => {
    // Clean up any trailing punctuation that shouldn't be part of the URL
    let cleanUrl = url.replace(/[.,;:!?()[\]{}'"]*$/, '');
    
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-2 transition-colors break-all inline-flex items-center gap-1">${cleanUrl} <svg class="w-3 h-3 flex-shrink-0 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>`;
  });
};

// Enhanced content formatter with link support
const formatContent = (content: string): string => {
  // First convert URLs to clickable links
  let formattedContent = renderContentWithLinks(content);
  
  // Then apply other formatting
  return formattedContent
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Convert ### headers to h3
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
    // Convert ## headers to h2
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-4 mb-2">$1</h2>')
    // Convert # headers to h1
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-4 mb-2">$1</h1>')
    // Convert > blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-2 text-gray-700 italic">$1</blockquote>')
    // Convert `code` to <code>
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono">$1</code>')
    // Convert numbered lists (1. item)
    .replace(/^(\d+)\.\s+(.*$)/gm, '<li class="ml-4 mb-1 list-decimal">$2</li>')
    // Convert bullet lists (- item or * item)
    .replace(/^[-*]\s+(.*$)/gm, '<li class="ml-4 mb-1 list-disc">$2</li>')
    // Convert line breaks to <br> for better formatting
    .replace(/\n/g, '<br>')
    // Wrap consecutive numbered list items in proper ol tags
    .replace(/(<li class="ml-4 mb-1 list-decimal">.*?<\/li>(?:<br><li class="ml-4 mb-1 list-decimal">.*?<\/li>)*)/g, '<ol class="list-decimal pl-6 my-2 space-y-1">$1</ol>')
    // Wrap consecutive bullet list items in proper ul tags
    .replace(/(<li class="ml-4 mb-1 list-disc">.*?<\/li>(?:<br><li class="ml-4 mb-1 list-disc">.*?<\/li>)*)/g, '<ul class="list-disc pl-6 my-2 space-y-1">$1</ul>')
    // Clean up extra breaks around lists
    .replace(/<br>(<[ou]l)/g, '$1')
    .replace(/(<\/[ou]l>)<br>/g, '$1')
    // Clean up multiple consecutive breaks
    .replace(/(<br>\s*){3,}/g, '<br><br>')
    // Clean up breaks in list items
    .replace(/(<li[^>]*>.*?)<br>(.*?<\/li>)/g, '$1 $2');
};

// Streaming indicator component
const StreamingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 mt-2">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
    <span className="text-xs text-gray-500 ml-2">AI is responding...</span>
  </div>
);

// Document Sources Component
const DocumentSources: React.FC<{ sources: DocumentSource[] }> = ({ sources }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-50';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Validate sources is an array and has content
  if (!Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  // Get the best matching document (highest relevance score)
  const bestMatch = sources.reduce((best, current) =>
    current.relevanceScore > best.relevanceScore ? current : best
  );

  return (
    <div className="mt-3 border-t border-gray-200 pt-3 hidden">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={14} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Best Matching Document</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-medium text-gray-900 flex-1 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {bestMatch.title}
          </h4>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(bestMatch.relevanceScore)}`}>
            {Math.round(bestMatch.relevanceScore * 100)}%
          </span>
        </div>

        <div className="space-y-1 text-xs text-gray-600">
          {bestMatch.versionName && (
            <div className="flex items-center gap-1">
              <Tag size={12} />
              <span>Version: {bestMatch.versionName}</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            {bestMatch.effectiveFrom && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>From: {formatDate(bestMatch.effectiveFrom)}</span>
              </div>
            )}
            {bestMatch.effectiveUntil && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Until: {formatDate(bestMatch.effectiveUntil)}</span>
              </div>
            )}
          </div>

          {bestMatch.description && (
            <p className="text-gray-500 mt-1 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {bestMatch.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  isStreaming = false,
  documentSources = []
}) => {
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
                  className="prose prose-base max-w-none [&_a]:text-blue-600 [&_a]:hover:text-blue-800 [&_a]:no-underline hover:[&_a]:underline [&_a]:transition-colors [&_a]:break-all"
                  dangerouslySetInnerHTML={{ __html: formatContent(content) }}
                />
                {isStreaming && <StreamingIndicator />}
              </>
            )}
          </div>
          
          {/* Document Sources - only for assistant messages */}
          {messageRole === "assistant" && Array.isArray(documentSources) && documentSources.length > 0 && (
            <DocumentSources sources={documentSources} />
          )}

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