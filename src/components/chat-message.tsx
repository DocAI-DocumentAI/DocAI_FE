import React from "react";
import { User, FileText, Calendar, Tag } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  // Can be array or JSON string from server; we'll normalize in component
  documentSources?: any;
  hasDocumentContext?: boolean;
};

// Normalize various documentSources shapes (array or JSON string) into DocumentSource[]
const normalizeDocumentSources = (input: any): DocumentSource[] => {
  try {
    let arr: any[] = [];
    if (!input) return [];
    if (Array.isArray(input)) arr = input;
    else if (typeof input === "string") {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) arr = parsed;
      else if (parsed && Array.isArray(parsed.sources)) arr = parsed.sources;
      else return [];
    } else if (typeof input === "object" && input !== null) {
      if (Array.isArray((input as any).sources)) arr = (input as any).sources;
      else if (Array.isArray((input as any).items)) arr = (input as any).items;
      else if (Array.isArray((input as any).data)) arr = (input as any).data;
      else if (Array.isArray((input as any).Documents)) arr = (input as any).Documents;
      else return [];
    }

    // Map fields to our DocumentSource interface
    const mapped: DocumentSource[] = arr
      .map((it: any) => {
        const documentId = it.documentId || it.DocumentId || it.id || it.ID || "";
        const title = it.title || it.Title || "";
        const versionId = it.versionId || it.VersionId || it.VersionID || "";
        const versionName = it.versionName || it.VersionName || "";
        const departmentId = it.departmentId || it.DepartmentId || "";
        const description = it.description ?? it.Description ?? null;
        const tags = it.tags ?? it.Tags ?? null;
        const effectiveFrom = it.effectiveFrom || it.EffectiveFrom || "";
        const effectiveUntil = it.effectiveUntil || it.EffectiveUntil || "";
        const relevanceScore =
          typeof it.relevanceScore === "number"
            ? it.relevanceScore
            : typeof it.RelevanceScore === "number"
            ? it.RelevanceScore
            : 0;
        const summary = it.summary || it.Summary || "";
        const approvalDate = it.approvalDate || it.ApprovalDate || null;

        if (!documentId) return null; // skip invalid

        return {
          documentId,
          title,
          versionId,
          versionName,
          departmentId,
          description,
          tags,
          effectiveFrom,
          effectiveUntil,
          relevanceScore,
          summary,
          approvalDate,
        } as DocumentSource;
      })
      .filter(Boolean) as DocumentSource[];

    return mapped;
  } catch {
    return [];
  }
};

// Improved streaming indicator component - appears inline with AI message
const StreamingIndicator: React.FC = () => (
  <div className="flex items-center py-2">
    <div className="flex space-x-1">
      <div
        className="w-2 h-2 rounded-full shadow-sm bg-gradient-to-r from-purple-500 to-blue-500 animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-2 h-2 rounded-full shadow-sm bg-gradient-to-r from-purple-500 to-blue-500 animate-bounce"
        style={{ animationDelay: "200ms" }}
      ></div>
      <div
        className="w-2 h-2 rounded-full shadow-sm bg-gradient-to-r from-purple-500 to-blue-500 animate-bounce"
        style={{ animationDelay: "400ms" }}
      ></div>
    </div>
  </div>
);

// Document Sources Component
// New logic: pick exact document by parsing [Id]<docId> from AI response content,
// then match it against the provided documentSources. If not found, fall back to
// highest relevance score. Clicking the card opens the document in a new tab.
const DocumentSources: React.FC<{ sources: DocumentSource[]; aiContent?: string }> = ({
  sources,
  aiContent,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };



  // Validate sources is an array and has content
  if (!Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  // Try to extract document id from AI content: pattern [Id]xxxxx (allow spaces, case-insensitive)
  let bestMatch: DocumentSource | null = null;
  let extractedId: string | undefined;
  if (typeof aiContent === "string" && aiContent.length > 0) {
    const idMatch = aiContent.match(/\[\s*Id\s*\]\s*([A-Za-z0-9-]+)/i);
    extractedId = idMatch?.[1]?.trim();
    if (extractedId) {
      const exact = sources.find((s) => s.documentId === extractedId);
      if (exact) {
        bestMatch = exact;
      }
    }
  }

  // If no [Id] is present or no exact match found, do not render anything
  if (!bestMatch) return null;

  const docUrl = `https://docai.asia/document/${bestMatch.documentId}`;

  return (
    <div className="pt-3 mt-3 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={14} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          Best Matching Document
        </span>
      </div>
      <a
        href={docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-3 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4
            className="flex-1 overflow-hidden font-medium text-gray-900"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {bestMatch.title}
          </h4>

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
            <p
              className="mt-1 overflow-hidden text-gray-500"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {bestMatch.description}
            </p>
          )}
        </div>
      </a>
    </div>
  );
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  isStreaming = false,
  documentSources = [],
}) => {
  // Convert role to string if it's a number (from API)
  const messageRole =
    typeof role === "number" ? (role === 1 ? "user" : "assistant") : role;

  // Format timestamp
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Normalize document sources to ensure we render even if API gives a JSON string
  const normalizedSources: DocumentSource[] = normalizeDocumentSources(documentSources);


  // Hide [Id]... tag in assistant message display, but keep original content for matching
  const displayContent =
    messageRole === "assistant"
      ? (content || "")
          // hide inline document id tag
          .replace(/\[\s*Id\s*\]\s*[A-Za-z0-9-]+/gi, "")
          // remove trailing backticks like `, `` or ``` left by the model
          .replace(/\s*`{1,3}\s*$/g, "")
          .trim()
      : content;

  return (
    <div
      className={`mb-3 flex ${
        messageRole === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[80%] ${
          messageRole === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 ${messageRole === "user" ? "ml-3" : "mr-3"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            messageRole === "user"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white border border-gray-200 shadow-sm"
          }`}>
            {messageRole === "user" ? (
              <User size={16} />
            ) : (
              <img src="/LOGO_SMALL.png" alt="AI" className="w-full h-full p-1 rounded-full" />
            )}
          </div>
        </div>

        {/* Message content */}
        <div className="flex flex-col">
          <div
            className={`rounded-lg px-4 py-3 ${
              messageRole === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-900"
            }`}
          >
            {messageRole === "user" ? (
              <div className="break-words whitespace-pre-wrap">{content}</div>
            ) : (
              <>
                {content ? (
                  <div className="prose prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:text-gray-700 prose-code:text-pink-600 prose-code:bg-gray-100 prose-pre:bg-gray-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {displayContent}
                    </ReactMarkdown>
                  </div>
                ) : null}

                {isStreaming && <StreamingIndicator />}
              </>
            )}
          </div>

          {/* Document Sources - only for assistant messages */}
          {messageRole === "assistant" &&
            normalizedSources.length > 0 && (
              <DocumentSources sources={normalizedSources} aiContent={content} />
            )}

          {/* Timestamp */}
          {timestamp && (
            <div
              className={`text-xs text-gray-500 mt-1 ${
                messageRole === "user" ? "text-right" : "text-left"
              }`}
            >
              {formatTime(timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
