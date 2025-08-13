import { api } from "./api";

export interface ChatSession {
  id: string;
  title: string;
  modelName: string;
  createdAt: string;
  lastActiveAt: string;
  messageCount: number;
  isModelActive: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: number; // 1 for user, 2 for assistant
  tokenCount: number;
  timestamp: string;
  documentSources?: any[];
  hasDocumentContext?: boolean;
}

export interface ChatSessionDetail {
  id: string;
  title: string;
  modelName: string;
  createdAt: string;
  lastActiveAt: string;
  messages: ChatMessage[];
  preferences: any[];
  isModelActive: boolean;
  canSendMessages: boolean;
}

export interface ChatModel {
  modelName: string;
  displayName: string;
  maxTokens: number;
  isDefault: boolean;
  isFree: boolean;
  temperature: number;
  topP: number;
}

export interface CreateChatRequest {
  title: string;
  modelName: string;
}

export interface SendMessageRequest {
  message: string;
  sessionId: string;
  modelName: string;
}

export interface SendMessageResponse {
  sessionId: string;
  message: string;
  role: number;
  tokenCount: number;
  timestamp: string;
  modelUsed: string;
}

export const getChatSessions = async (): Promise<ChatSession[]> => {
  const response = await api.get("/chatbox/sessions");
  return response.data;
};

export const getChatSessionDetail = async (
  sessionId: string
): Promise<ChatSessionDetail> => {
  const response = await api.get(`/chatbox/session/${sessionId}`);
  return response.data;
};

export const getChatModels = async (): Promise<ChatModel[]> => {
  const response = await api.get("/chatbox/models");
  return response.data;
};

export const createChatSession = async (
  data: CreateChatRequest
): Promise<ChatSession> => {
  const response = await api.post("/chatbox/session", data);
  return response.data;
};

export const sendMessage = async (
  data: SendMessageRequest
): Promise<SendMessageResponse> => {
  const response = await api.post("/chatbox/send", data);
  return response.data;
};

export interface StreamingMessageChunk {
  content: string;
  isComplete: boolean;
  sessionId?: string;
  messageId?: string;
  timestamp?: string;
  role?: number;
  tokenCount?: number;
  modelUsed?: string;
  documentSources?: any;
  hasDocumentContext?: boolean;
}

export interface ServerStreamChunk {
  sessionId: string;
  messageChunk: string;
  message: string;
  role: number;
  timestamp: string;
  modelUsed: string;
  documentSources: any;
  hasDocumentContext: boolean;
  isComplete: boolean;
  totalTokenCount: number | null;
}

export const sendMessageStream = async (
  data: SendMessageRequest,
  onChunk: (chunk: StreamingMessageChunk) => void,
  onComplete: (finalMessage: SendMessageResponse) => void,
  onError: (error: Error) => void,
  timeoutMs: number = 300000 // 5 minutes default timeout
): Promise<void> => {
  // Set up timeout
  const timeoutId = setTimeout(() => {
    onError(new Error("Request timeout - the response took too long"));
  }, timeoutMs);

  try {
    const token = localStorage.getItem("token");
    const baseURL = "http://localhost:5000/api";

    const response = await fetch(`${baseURL}/chatbox/send/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      clearTimeout(timeoutId);
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream completed - finalize message
          clearTimeout(timeoutId);
          const finalMessage: SendMessageResponse = {
            sessionId: data.sessionId,
            message: accumulatedContent,
            role: 2, // assistant
            tokenCount: 0,
            timestamp: new Date().toISOString(),
            modelUsed: data.modelName,
          };
          onComplete(finalMessage);
          break;
        }

        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process Server-Sent Events format
        let lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            console.log('📦 Raw streaming chunk:', trimmedLine);

            // Handle Server-Sent Events format
            if (trimmedLine.startsWith('event:')) {
              // Skip event type lines
              continue;
            } else if (trimmedLine.startsWith('data:')) {
              // Extract JSON data from SSE data line
              const jsonData = trimmedLine.substring(5).trim(); // Remove 'data:' prefix

              if (jsonData) {
                try {
                  // Parse the JSON chunk from server
                  const serverChunk: ServerStreamChunk = JSON.parse(jsonData);

                  console.log('✅ Parsed streaming chunk:', {
                    sessionId: serverChunk.sessionId,
                    messageChunk: serverChunk.messageChunk,
                    messageLength: serverChunk.message?.length || 0,
                    isComplete: serverChunk.isComplete,
                    hasDocumentContext: serverChunk.hasDocumentContext
                  });

                  // Update accumulated content with the full message so far
                  // Use the full message from server, not just the chunk
                  if (serverChunk.message !== undefined && serverChunk.message !== null) {
                    accumulatedContent = serverChunk.message;
                  }

                  // Send the streaming chunk to update UI
                  const streamChunk: StreamingMessageChunk = {
                    content: accumulatedContent,
                    isComplete: serverChunk.isComplete,
                    sessionId: serverChunk.sessionId,
                    messageId: Date.now().toString(),
                    timestamp: serverChunk.timestamp,
                    role: serverChunk.role,
                    tokenCount: serverChunk.totalTokenCount || 0,
                    modelUsed: serverChunk.modelUsed,
                    documentSources: serverChunk.documentSources,
                    hasDocumentContext: serverChunk.hasDocumentContext,
                  };

                  onChunk(streamChunk);

                  // If this chunk indicates completion, we can break early
                  if (serverChunk.isComplete) {
                    console.log('🏁 Stream completed, finalizing message');
                    clearTimeout(timeoutId);
                    const finalMessage: SendMessageResponse = {
                      sessionId: serverChunk.sessionId,
                      message: serverChunk.message,
                      role: serverChunk.role,
                      tokenCount: serverChunk.totalTokenCount || 0,
                      timestamp: serverChunk.timestamp,
                      modelUsed: serverChunk.modelUsed,
                    };
                    onComplete(finalMessage);
                    return;
                  }
                } catch (parseError) {
                  console.warn('❌ Failed to parse streaming chunk JSON:', jsonData, parseError);
                  // Continue processing other chunks even if one fails to parse
                }
              }
            } else {
              // Handle lines that might be pure JSON (fallback)
              try {
                const serverChunk: ServerStreamChunk = JSON.parse(trimmedLine);

                console.log('✅ Parsed direct JSON chunk:', {
                  sessionId: serverChunk.sessionId,
                  messageChunk: serverChunk.messageChunk,
                  messageLength: serverChunk.message?.length || 0,
                  isComplete: serverChunk.isComplete,
                  hasDocumentContext: serverChunk.hasDocumentContext
                });

                if (serverChunk.message !== undefined && serverChunk.message !== null) {
                  accumulatedContent = serverChunk.message;
                }

                const streamChunk: StreamingMessageChunk = {
                  content: accumulatedContent,
                  isComplete: serverChunk.isComplete,
                  sessionId: serverChunk.sessionId,
                  messageId: Date.now().toString(),
                  timestamp: serverChunk.timestamp,
                  role: serverChunk.role,
                  tokenCount: serverChunk.totalTokenCount || 0,
                  modelUsed: serverChunk.modelUsed,
                  documentSources: serverChunk.documentSources,
                  hasDocumentContext: serverChunk.hasDocumentContext,
                };

                onChunk(streamChunk);

                if (serverChunk.isComplete) {
                  console.log('🏁 Stream completed, finalizing message');
                  clearTimeout(timeoutId);
                  const finalMessage: SendMessageResponse = {
                    sessionId: serverChunk.sessionId,
                    message: serverChunk.message,
                    role: serverChunk.role,
                    tokenCount: serverChunk.totalTokenCount || 0,
                    timestamp: serverChunk.timestamp,
                    modelUsed: serverChunk.modelUsed,
                  };
                  onComplete(finalMessage);
                  return;
                }
              } catch (parseError) {
                console.warn('❌ Failed to parse line as JSON:', trimmedLine, parseError);
                // Continue processing other chunks even if one fails to parse
              }
            }
          }
        }
      }
    } catch (readError) {
      clearTimeout(timeoutId);
      onError(
        new Error(
          `Stream reading failed: ${
            readError instanceof Error ? readError.message : "Unknown error"
          }`
        )
      );
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    clearTimeout(timeoutId);
    onError(
      error instanceof Error ? error : new Error("Unknown streaming error")
    );
  }
};
