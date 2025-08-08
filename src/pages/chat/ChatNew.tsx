import { useEffect, useRef } from "react"  
import { useNavigate } from "react-router-dom"
import { useChat } from "../../context/chat-context"   
import { ChatInput } from "../../components/chat-input"
import ChatSidebar from "../../components/ChatSidebar"
import ModelSelector from "../../components/ModelSelector"
import ChatMessage from "../../components/chat-message"

export default function NewChatPage() {
  const { 
    startNewTempChat, 
    currentChat, 
    sendMessage, 
    changeModel, 
    sending, 
    loading
  } = useChat()
  const hasInitialized = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentChat?.messages])

  // Start a temp chat when component mounts
  useEffect(() => {
    if (!hasInitialized.current) {
      startNewTempChat();
      hasInitialized.current = true
    }
    
    // Reset when component unmounts
    return () => {
      hasInitialized.current = false
    }
  }, [startNewTempChat])

  const handleSendMessage = (message: string) => {
    sendMessage(message, navigate)
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <ChatSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 pt-14 lg:pt-0">
          <p className="text-gray-500">Setting up new chat...</p>
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
              <h1 className="text-lg font-semibold text-gray-900">New Chat</h1>
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
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="w-full max-w-2xl px-4">
                <div className="mb-16 text-center">
                  <h1 className="text-2xl font-medium">How can I help you today?</h1>
                  {currentChat && (
                    <p className="text-gray-500 mt-2">
                      Using {currentChat.modelName}
                    </p>
                  )}
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
            disabled={sending || !currentChat}
          />
          {sending && (
            <div className="text-center text-sm text-gray-500 mt-2">
              Creating chat and sending message...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
