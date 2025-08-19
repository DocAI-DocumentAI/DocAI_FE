import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Select,
  Tooltip,
  message
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  MinusOutlined,
  RobotOutlined,
  FileTextOutlined,
  LockOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { sendMessageStream, getChatModels, createChatSession } from '../lib/api/chat';
import ChatMessage from './chat-message';

const { Text } = Typography;
const { TextArea } = Input;



interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
  documentSources?: any[];
  hasDocumentContext?: boolean;
}

interface DocumentChatBoxProps {
  documentId: string;
  documentTitle: string;
}

export const DocumentChatBox: React.FC<DocumentChatBoxProps> = ({
  documentId,
  documentTitle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // Load available models
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const models = await getChatModels();
        setModels(models);
        // Set default model if available
        if (models.length > 0) {
          setSelectedModel(models[0].modelName);
        }
      } catch (error) {
        console.error('Failed to load models:', error);
        message.error('Failed to load AI models');
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if chat has started based on existing messages
  useEffect(() => {
    if (messages.length > 0 && !hasChatStarted) {
      setHasChatStarted(true);
    }
  }, [messages, hasChatStarted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewChat = () => {
    setMessages([]);
    setHasChatStarted(false);
    setSessionId(null);
    setInputValue('');
    message.success('Started new conversation');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming || !selectedModel) {
      if (!selectedModel) {
        message.warning('Please select an AI model first');
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsStreaming(true);

    // Mark that chat has started - prevent model changes
    if (!hasChatStarted) {
      setHasChatStarted(true);
    }

    // Create AI response message placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: '', // Start with empty content
      isUser: false,
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Ensure we have a session ID like ChatDetail does
      let effectiveSessionId = sessionId;
      if (!effectiveSessionId) {
        const created = await createChatSession({ title: '', modelName: selectedModel });
        effectiveSessionId = created.id;
        setSessionId(effectiveSessionId);
      }

      const payload = {
        message: userMessage.content,
        sessionId: effectiveSessionId!,
        modelName: selectedModel,
        documentId: documentId
      } as const;

      await sendMessageStream(
        payload,
        (chunk: any) => {
          // Handle streaming chunks - use chunk.content (full accumulated content)
          const chunkContent = chunk.content || '';
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: chunkContent || msg.content,
                    isStreaming: !chunk.isComplete,
                    documentSources: chunk.documentSources ?? msg.documentSources,
                    hasDocumentContext: chunk.hasDocumentContext ?? msg.hasDocumentContext
                  }
                : msg
            )
          );
        },
        (finalMessage: any) => {
          // Handle completion
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: finalMessage.message || msg.content,
                    isStreaming: false
                  }
                : msg
            )
          );
          console.log('Chat completed:', finalMessage);
        },
        (error: any) => {
          console.error('Streaming error:', error);
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
                : msg
            )
          );
          message.error('Failed to get AI response');
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
            : msg
        )
      );
      message.error('Failed to send message');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Tooltip title="Chat with this document" placement="left">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={toggleChat}
            className="shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700"
            style={{ width: '56px', height: '56px' }}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className="shadow-2xl border-0 overflow-hidden transition-all duration-300"
        style={{
          width: '500px',
          height: isMinimized ? '60px' : '700px',
          borderRadius: '12px'
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <FileTextOutlined className="text-white" />
            <div className="flex-1 min-w-0">
              <Text className="text-white font-medium text-sm block truncate">
                Chat with Document
              </Text>
              <Text className="text-blue-100 text-xs block truncate">
                {documentTitle}
              </Text>
            </div>
          </div>
          <Space>
            {hasChatStarted && (
              <Tooltip title="Start a new conversation">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={startNewChat}
                  className="text-white hover:bg-blue-700 border-0"
                />
              </Tooltip>
            )}
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined />}
              onClick={toggleMinimize}
              className="text-white hover:bg-blue-700 border-0"
            />
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={toggleChat}
              className="text-white hover:bg-blue-700 border-0"
            />
          </Space>
        </div>

        {/* Content - only show when not minimized */}
        {!isMinimized && (
          <>
            {/* Model Selection */}
            <div className="p-3 border-b bg-gray-50">
              <Tooltip
                title={hasChatStarted ? "Cannot change model after starting the conversation" : "Select an AI model to chat with"}
                placement="top"
              >
                <Select
                  value={selectedModel}
                  onChange={setSelectedModel}
                  placeholder="Select AI Model"
                  size="small"
                  style={{ width: '100%' }}
                  loading={loadingModels}
                  disabled={hasChatStarted}
                >
                  {models.map(model => (
                    <Select.Option key={model.modelName} value={model.modelName}>
                      <div className="flex items-center">
                        <RobotOutlined className="mr-2" />
                        {model.displayName || model.modelName}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Tooltip>
              {hasChatStarted && (
                <Text type="secondary" className="text-xs mt-1 block">
                  <LockOutlined className="mr-1" />
                  Model locked for this conversation
                </Text>
              )}
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ height: '520px', display: 'flex', flexDirection: 'column' }}
            >
              <div className="flex-grow space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <RobotOutlined className="text-2xl mb-2" />
                    <Text type="secondary">
                      Ask me anything about this document!
                    </Text>
                  </div>
                )}
                
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.isUser ? 'user' : 'assistant'}
                    content={message.content}
                    timestamp={message.timestamp}
                    isStreaming={message.isStreaming}
                  />
                ))}
                
                {/* REMOVED BLOCK: The isStreaming indicator was removed from here.
                  The visual feedback is now handled by the AI message bubble appearing and being populated with text.
                */}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
              <div className="flex space-x-2">
                <TextArea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this document..."
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  disabled={isStreaming || !selectedModel}
                  className="flex-1"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isStreaming || !selectedModel}
                  loading={isStreaming}
                />
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};