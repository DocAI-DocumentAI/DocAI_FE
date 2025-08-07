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