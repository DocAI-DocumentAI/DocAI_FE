"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  getChatSessionDetail, 
  sendMessage as sendMessageAPI, 
  createChatSession,
  getChatModels,
  ChatSessionDetail
} from '../lib/api/chat';

export interface TempChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | number;
  timestamp: Date | string;
  isTemp?: boolean;
}

export interface TempChatSession {
  id: null;
  title: string;
  modelName: string;
  messages: TempChatMessage[];
  isTemp: true;
  canSendMessages: boolean;
  isModelActive: boolean;
  createdAt: string;
  lastActiveAt: string;
  preferences: any[];
}

type CurrentChat = ChatSessionDetail | TempChatSession | null;

interface ChatContextType {
  currentChat: CurrentChat;
  loading: boolean;
  sending: boolean;
  startNewTempChat: () => Promise<void>;
  sendMessage: (message: string, navigate?: (path: string, options?: any) => void) => Promise<void>;
  loadChatDetail: (chatId: string) => Promise<void>;
  changeModel: (modelName: string) => void;
  clearCurrentChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [currentChat, setCurrentChat] = useState<CurrentChat>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const startNewTempChat = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch models from API to get the default one
      const models = await getChatModels();
      const defaultModel = models.find(m => m.isDefault) || models[0];
      
      if (!defaultModel) {
        throw new Error('No models available');
      }

      const tempChat: TempChatSession = {
        id: null,
        title: 'New Chat',
        modelName: defaultModel.modelName,
        messages: [],
        isTemp: true,
        canSendMessages: true,
        isModelActive: true,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        preferences: []
      };
      setCurrentChat(tempChat);
    } catch (error) {
      console.error('Failed to start new temp chat:', error);
      // Fallback to a default model if API fails
      const tempChat: TempChatSession = {
        id: null,
        title: 'New Chat',
        modelName: 'gpt-3.5-turbo',
        messages: [],
        isTemp: true,
        canSendMessages: true,
        isModelActive: true,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        preferences: []
      };
      setCurrentChat(tempChat);
    } finally {
      setLoading(false);
    }
  }, []);


  const sendMessage = useCallback(async (message: string, navigate?: (path: string, options?: any) => void) => {
    if (!currentChat || sending) return;


    setSending(true);
    
    try {
      // Add user message immediately to UI
      const userMessage: TempChatMessage = {
        id: Date.now().toString(),
        content: message,
        role: "user",
        timestamp: new Date(),
        isTemp: 'isTemp' in currentChat ? currentChat.isTemp : false
      };

      let updatedChat: CurrentChat;
      // If temp chat, add as TempChatMessage, else as ChatMessage
      if ('isTemp' in currentChat && currentChat.isTemp) {
        updatedChat = {
          ...currentChat,
          messages: [...currentChat.messages, userMessage]
        };
      } else {
        // For real chat, convert userMessage to ChatMessage
        const chatMessage = {
          id: userMessage.id,
          content: userMessage.content,
          role: typeof userMessage.role === "number" ? userMessage.role : (userMessage.role === "user" ? 1 : 2),
          tokenCount: 0,
          timestamp: typeof userMessage.timestamp === "string" ? userMessage.timestamp : (userMessage.timestamp as Date).toISOString()
        };
        updatedChat = {
          ...currentChat,
          messages: [...(currentChat as any).messages, chatMessage]
        };
      }
      setCurrentChat(updatedChat);

      let sessionId = currentChat.id;

      // If this is a temp chat, create a real session first
      if (('isTemp' in currentChat && currentChat.isTemp) || !sessionId) {
        const createResponse = await createChatSession({
          title: ``,
          modelName: currentChat.modelName
        });
        sessionId = createResponse.id;
        
        // Update to real chat - remove isTemp property and convert messages to ChatMessage[]
        const { isTemp, ...chatWithoutTemp } = updatedChat as any;
        const chatMessages = (chatWithoutTemp.messages as TempChatMessage[]).map((msg: TempChatMessage) => ({
          id: msg.id,
          content: msg.content,
          role: typeof msg.role === "number" ? msg.role : (msg.role === "user" ? 1 : 2),
          tokenCount: 0, // Set to 0 or fetch actual token count if available
          timestamp: typeof msg.timestamp === "string" ? msg.timestamp : (msg.timestamp as Date).toISOString()
        }));
        updatedChat = {
          ...chatWithoutTemp,
          id: sessionId,
          title: createResponse.title,
          messages: chatMessages
        } as ChatSessionDetail;
        setCurrentChat(updatedChat);
        
        // Navigate to the new chat detail page using passed navigate function
        if (navigate) {
          navigate(`/chat/${sessionId}`, { replace: true });
        }
      }

      // Send message to API
      const response = await sendMessageAPI({
        message,
        sessionId: sessionId!,
        modelName: currentChat.modelName
      });

      // Add assistant response
      const assistantMessage: TempChatMessage = {
        id: response.timestamp,
        content: response.message,
        role: response.role,
        timestamp: response.timestamp
      };

      setCurrentChat(prev => {
        if (!prev) return null;
        // If temp chat, allow TempChatMessage
        if ('isTemp' in prev && prev.isTemp) {
          return {
            ...prev,
            messages: [...prev.messages, assistantMessage]
          };
        } else {
          // For real chat, convert assistantMessage to ChatMessage
          const chatMessage = {
            id: assistantMessage.id,
            content: assistantMessage.content,
            role: typeof assistantMessage.role === "number" ? assistantMessage.role : (assistantMessage.role === "user" ? 1 : 2),
            tokenCount: 0, // You may want to set this properly if available
            timestamp: typeof assistantMessage.timestamp === "string" ? assistantMessage.timestamp : (assistantMessage.timestamp as Date).toISOString()
          };
          return {
            ...prev,
            messages: [...(prev as any).messages, chatMessage]
          };
        }
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the user message on error
      setCurrentChat(prev => {
        if (!prev) return null;
        if ('isTemp' in prev && prev.isTemp) {
          // TempChatSession: messages is TempChatMessage[]
          return {
            ...prev,
            messages: (prev.messages as TempChatMessage[]).slice(0, -1)
          };
        } else {
          // ChatSessionDetail: messages is ChatMessage[]
          return {
            ...prev,
            messages: (prev.messages as any[]).slice(0, -1)
          };
        }
      });
    } finally {
      setSending(false);
    }
  }, [currentChat, sending]);

  const loadChatDetail = useCallback(async (chatId: string) => {
    if (!chatId || chatId === 'new') return;
    
    setLoading(true);
    try {
      const chatDetail = await getChatSessionDetail(chatId);
      setCurrentChat(chatDetail);
    } catch (error) {
      console.error('Failed to load chat detail:', error);
      setCurrentChat(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const changeModel = useCallback((modelName: string) => {
    if (currentChat) {
      setCurrentChat({
        ...currentChat,
        modelName
      });
    }
  }, [currentChat]);

  const clearCurrentChat = useCallback(() => {
    setCurrentChat(null);
  }, []);

  const contextValue: ChatContextType = {
    currentChat,
    loading,
    sending,
    startNewTempChat,
    sendMessage,
    loadChatDetail,
    changeModel,
    clearCurrentChat
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
