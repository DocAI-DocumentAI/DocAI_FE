"use client"

import { useEffect, useRef } from "react" 
import { useParams } from "react-router-dom"
import { useChat } from "../../context/chat-context"
import { ChatInput } from "../../components/chat-input"
import ChatSidebar from "../../components/ChatSidebar" 
import ChatMessage from "../../components/chat-message"

export default function ChatPage() {
  const { id } = useParams()
  const { chatHistory, currentChat, setCurrentChat, sendMessage } = useChat()
  const chatIdRef = useRef(id)

  // Only update the current chat when the ID changes or on initial load
  useEffect(() => {
    if (id !== chatIdRef.current) {
      chatIdRef.current = id as string
    }

    const chat = chatHistory.find((c) => c.id === id)
    if (chat && (!currentChat || currentChat.id !== id)) {
      setCurrentChat(chat)
    }
  }, [id, setCurrentChat, chatHistory, currentChat])

  if (!currentChat) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <div className="flex-1 flex flex-col pt-14 lg:pt-0">
        <div className="flex-1 overflow-y-auto">
          {currentChat.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="w-full max-w-2xl px-4">
                <div className="mb-16 text-center">
                  <h1 className="text-2xl font-medium">How can I help you today?</h1>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl mx-auto px-4 py-8">
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} role={message.role} content={message.content} />
              ))}
            </div>
          )}
        </div>
        <div className="w-full max-w-2xl px-4 pb-8 pt-4 mx-auto">
          <ChatInput onSend={sendMessage} placeholder="Ask anything" />
        </div>
      </div>
    </div>
  )
}
