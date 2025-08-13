import { useEffect, useRef } from "react" 
import { useParams, useNavigate } from "react-router-dom"
import { useChat } from "../../context/chat-context"
import { ChatInput } from "../../components/chat-input"
import ChatSidebar from "../../components/ChatSidebar" 
import ChatMessage from "../../components/chat-message"
import ModelSelector from "../../components/ModelSelector"

export default function ChatPage() {
  const { id } = useParams()
  const { currentChat, sendMessage, loadChatDetail, changeModel, loading, sending, streaming } = useChat()
  const chatIdRef = useRef(id)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentChat?.messages])

  // Load chat detail when component mounts or ID changes
  useEffect(() => {
    if (id && id !== 'new') {
      if (!currentChat || currentChat.id !== id || chatIdRef.current !== id) {
        chatIdRef.current = id as string
        loadChatDetail(id)
      }
    }
  }, [id, loadChatDetail])

  const handleSendMessage = (message: string) => {
    sendMessage(message, navigate)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ChatSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 pt-14 lg:pt-0">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  if (id !== 'new' && (!currentChat || currentChat.id !== id)) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ChatSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 pt-14 lg:pt-0">
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base">Chat not found.</p>
            <button
              onClick={() => navigate('/chat/new')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Start New Chat
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar />
      <div className="flex-1 flex flex-col pt-14 lg:pt-0 min-w-0">
        {/* Chat Header */}
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {currentChat?.title || 'New Chat'}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 ml-4">
              {/* Model Selector */}
              {currentChat && (
                <div className="hidden sm:block">
                  <ModelSelector
                    selectedModel={currentChat.modelName}
                    onModelChange={changeModel}
                    disabled={sending}
                  />
                </div>
              )}
              {/* Status indicator */}
              {currentChat?.isModelActive && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs sm:text-sm text-green-600 hidden sm:inline">Active</span>
                </div>
              )}
            </div>
          </div>
          {/* Mobile Model Selector */}
          {currentChat && (
            <div className="mt-3 sm:hidden">
              <ModelSelector
                selectedModel={currentChat.modelName}
                onModelChange={changeModel}
                disabled={sending}
              />
            </div>
          )}
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-4">
              <div className="w-full max-w-4xl">
                <div className="text-center">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-800 mb-4">
                    How can I help you today?
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                    Start a conversation by typing your question below.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              <div className="space-y-4 sm:space-y-6">
                {currentChat.messages.map((message, index) => (
                  <ChatMessage
                    key={message.id || index}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                    isStreaming={(message as any).isStreaming}
                    documentSources={(message as any).documentSources}
                    hasDocumentContext={(message as any).hasDocumentContext}
                  />
                ))}
              </div>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="w-full max-w-4xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              placeholder="Ask anything..."
              disabled={(!currentChat?.canSendMessages) || sending || streaming}
            />
            {sending && (
              <div className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-3 w-3 border border-gray-300 border-t-blue-600 rounded-full"></div>
                  Sending message...
                </div>
              </div>
            )}
            {streaming && (
              <div className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-3 w-3 border border-gray-300 border-t-blue-600 rounded-full"></div>
                  AI is responding...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
