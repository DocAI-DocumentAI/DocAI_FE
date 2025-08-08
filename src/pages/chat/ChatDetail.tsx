import { useEffect, useRef } from "react" 
import { useParams, useNavigate } from "react-router-dom"
import { useChat } from "../../context/chat-context"
import { ChatInput } from "../../components/chat-input"
import ChatSidebar from "../../components/ChatSidebar" 
import ChatMessage from "../../components/chat-message"
import ModelSelector from "../../components/ModelSelector"

export default function ChatPage() {
  const { id } = useParams()
  const { currentChat, sendMessage, loadChatDetail, changeModel, loading, sending } = useChat()
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
      <div className="flex h-screen">
        <ChatSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 pt-14 lg:pt-0">
          <p className="text-gray-500">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (id !== 'new' && (!currentChat || currentChat.id !== id)) {
    return (
      <div className="flex h-screen">
        <ChatSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 pt-14 lg:pt-0">
          <p className="text-gray-500">Chat not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <div className="flex-1 flex flex-col pt-14 lg:pt-0">
        {/* Chat Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {currentChat?.title || 'New Chat'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Model Selector */}
              {currentChat && (
                <ModelSelector
                  selectedModel={currentChat.modelName}
                  onModelChange={changeModel}
                  disabled={sending}
                />
              )}
              {/* Status indicator */}
              {currentChat?.isModelActive && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="w-full max-w-2xl px-4">
                <div className="mb-16 text-center">
                  <h1 className="text-2xl font-medium">How can I help you today?</h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl mx-auto px-4 py-8">
              {currentChat.messages.map((message, index) => (
                <ChatMessage 
                  key={message.id || index} 
                  role={message.role} 
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="w-full max-w-2xl px-4 pb-8 pt-4 mx-auto">
          <ChatInput 
            onSend={handleSendMessage} 
            placeholder="Ask anything"
            disabled={(!currentChat?.canSendMessages) || sending}
          />
          {sending && (
            <div className="text-center text-sm text-gray-500 mt-2">
              Sending message...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
