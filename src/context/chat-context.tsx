"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  getChatSessionDetail,
  sendMessageStream,
  createChatSession,
  getChatModels,
  ChatSessionDetail,
  StreamingMessageChunk
} from '../lib/api/chat';

export interface TempChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | number;
  timestamp: Date | string;
  isTemp?: boolean;
  isStreaming?: boolean;
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
  streaming: boolean;
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
  const [streaming, setStreaming] = useState(false);
  // Cache to store loaded chats and prevent reloading
  const [chatCache, setChatCache] = useState<Map<string, ChatSessionDetail>>(new Map());

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
    if (!currentChat || sending || streaming) return;

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

      setSending(false);
      setStreaming(true);

      // Create placeholder assistant message for streaming
      const assistantMessageId = Date.now().toString() + '_assistant';
      const placeholderAssistantMessage: TempChatMessage = {
        id: assistantMessageId,
        content: '',
        role: "assistant",
        timestamp: new Date(),
        isStreaming: true
      };

      // Add placeholder assistant message to UI
      setCurrentChat(prev => {
        if (!prev) return null;
        let updatedChat: CurrentChat;
        if ('isTemp' in prev && prev.isTemp) {
          updatedChat = {
            ...prev,
            messages: [...prev.messages, placeholderAssistantMessage]
          };
        } else {
          const chatMessage = {
            id: placeholderAssistantMessage.id,
            content: placeholderAssistantMessage.content,
            role: 2, // assistant
            tokenCount: 0,
            timestamp: typeof placeholderAssistantMessage.timestamp === "string" ? placeholderAssistantMessage.timestamp : (placeholderAssistantMessage.timestamp as Date).toISOString()
          };
          updatedChat = {
            ...prev,
            messages: [...(prev as any).messages, chatMessage]
          } as ChatSessionDetail;
        }
        return updatedChat;
      });

      // Start streaming
      await sendMessageStream(
        {
          message,
          sessionId: sessionId!,
          modelName: currentChat.modelName
        },
        // onChunk callback
        (chunk: StreamingMessageChunk) => {
          setCurrentChat(prev => {
            if (!prev) return null;

            const messages = [...(prev as any).messages];
            const lastMessageIndex = messages.length - 1;

            if (lastMessageIndex >= 0 && messages[lastMessageIndex].id === assistantMessageId) {
              // Update the streaming message content
              if ('isTemp' in prev && prev.isTemp) {
                messages[lastMessageIndex] = {
                  ...messages[lastMessageIndex],
                  content: chunk.content,
                  isStreaming: !chunk.isComplete
                };
                return {
                  ...prev,
                  messages
                };
              } else {
                messages[lastMessageIndex] = {
                  ...messages[lastMessageIndex],
                  content: chunk.content
                };
                const updatedChat = {
                  ...prev,
                  messages
                } as ChatSessionDetail;

                // Update cache for real chats
                if (prev.id) {
                  setChatCache(cache => new Map(cache).set(prev.id!, updatedChat));
                }
                return updatedChat;
              }
            }
            return prev;
          });
        },
        // onComplete callback
        (finalMessage) => {
          setCurrentChat(prev => {
            if (!prev) return null;

            const messages = [...(prev as any).messages];
            const lastMessageIndex = messages.length - 1;

            if (lastMessageIndex >= 0 && messages[lastMessageIndex].id === assistantMessageId) {
              // Finalize the message
              if ('isTemp' in prev && prev.isTemp) {
                messages[lastMessageIndex] = {
                  ...messages[lastMessageIndex],
                  content: finalMessage.message,
                  isStreaming: false,
                  timestamp: finalMessage.timestamp
                };
                return {
                  ...prev,
                  messages
                };
              } else {
                messages[lastMessageIndex] = {
                  ...messages[lastMessageIndex],
                  content: finalMessage.message,
                  timestamp: finalMessage.timestamp,
                  tokenCount: finalMessage.tokenCount
                };
                const updatedChat = {
                  ...prev,
                  messages
                } as ChatSessionDetail;

                // Update cache for real chats
                if (prev.id) {
                  setChatCache(cache => new Map(cache).set(prev.id!, updatedChat));
                }
                return updatedChat;
              }
            }
            return prev;
          });
          setStreaming(false);
        },
        // onError callback
        (error) => {
          console.error('Streaming failed:', error);

          // Show error message to user by replacing the placeholder with an error message
          setCurrentChat(prev => {
            if (!prev) return null;
            const messages = [...(prev as any).messages];
            const lastMessageIndex = messages.length - 1;

            if (lastMessageIndex >= 0 && messages[lastMessageIndex].id === assistantMessageId) {
              // Replace placeholder with error message
              const errorMessage = "Sorry, I encountered an error while processing your request. Please try again.";

              if ('isTemp' in prev && prev.isTemp) {
                messages[lastMessageIndex] = {
                  ...messages[lastMessageIndex],
                  content: errorMessage,
                  isStreaming: false
                };
                return {
                  ...prev,
                  messages
                };
              } else {
                messages[lastMessageIndex] = {
                  ...messages[lastMessageIndex],
                  content: errorMessage
                };
                const updatedChat = {
                  ...prev,
                  messages
                } as ChatSessionDetail;

                // Update cache for real chats
                if (prev.id) {
                  setChatCache(cache => new Map(cache).set(prev.id!, updatedChat));
                }
                return updatedChat;
              }
            }
            return prev;
          });
          setStreaming(false);
        }
      );

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
      setSending(false);
      setStreaming(false);
    }
  }, [currentChat, sending, streaming, setChatCache, setStreaming]);

  const loadChatDetail = useCallback(async (chatId: string) => {
    if (!chatId || chatId === 'new') return;

    // Check if chat is already cached
    if (chatCache.has(chatId)) {
      const cachedChat = chatCache.get(chatId)!;
      setCurrentChat(cachedChat);
      return;
    }

    setLoading(true);
    try {
      const chatDetail = await getChatSessionDetail(chatId);
      // Cache the loaded chat
      setChatCache(prev => new Map(prev).set(chatId, chatDetail));
      setCurrentChat(chatDetail);
    } catch (error) {
      console.error('Failed to load chat detail:', error);
      setCurrentChat(null);
    } finally {
      setLoading(false);
    }
  }, [chatCache]);

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
    streaming,
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
