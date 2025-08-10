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
  const response = await api.get('/chatbox/sessions');
  return response.data;
};

export const getChatSessionDetail = async (sessionId: string): Promise<ChatSessionDetail> => {
  const response = await api.get(`/chatbox/session/${sessionId}`);
  return response.data;
};

export const getChatModels = async (): Promise<ChatModel[]> => {
  const response = await api.get('/chatbox/models');
  return response.data;
};

export const createChatSession = async (data: CreateChatRequest): Promise<ChatSession> => {
  const response = await api.post('/chatbox/session', data);
  return response.data;
};

export const sendMessage = async (data: SendMessageRequest): Promise<SendMessageResponse> => {
  const response = await api.post('/chatbox/send', data);
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
    onError(new Error('Request timeout - the response took too long'));
  }, timeoutMs);

  try {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const response = await fetch(`${baseURL}/chatbox/send/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      clearTimeout(timeoutId);
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';

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
            modelUsed: data.modelName
          };
          onComplete(finalMessage);
          break;
        }

        // Decode the chunk directly as text
        const chunk = decoder.decode(value, { stream: true });

        if (chunk) {
          accumulatedContent += chunk;

          // Send the accumulated content to update UI
          const streamChunk: StreamingMessageChunk = {
            content: accumulatedContent,
            isComplete: false,
            sessionId: data.sessionId,
            messageId: Date.now().toString(),
            timestamp: new Date().toISOString(),
            role: 2,
            tokenCount: 0,
            modelUsed: data.modelName
          };

          onChunk(streamChunk);
        }
      }
    } catch (readError) {
      clearTimeout(timeoutId);
      onError(new Error(`Stream reading failed: ${readError instanceof Error ? readError.message : 'Unknown error'}`));
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    clearTimeout(timeoutId);
    onError(error instanceof Error ? error : new Error('Unknown streaming error'));
  }
};

// User Preferences interfaces
export interface UserPreferences {
  userId: string;
  sessionId: string | null;
  userName: string;
  chatbotCharacteristics: string[];
  additionalInfo: string;
  applyToNewChats: boolean;
  hasAnyPreferences: boolean;
}

export interface UpdateUserPreferencesRequest {
  userName: string;
  chatbotCharacteristics: string[];
  additionalInfo: string;
  applyToNewChats: boolean;
}

// Get user preferences
export const getUserPreferences = async (): Promise<UserPreferences> => {
  const response = await api.get('/chatbox/user/preferences');
  return response.data;
};

// Update user preferences
export const updateUserPreferences = async (data: UpdateUserPreferencesRequest): Promise<UserPreferences> => {
  const response = await api.patch('/chatbox/user', data);
  return response.data;
};

// Delete chat session
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/chatbox/session/${sessionId}`);
};