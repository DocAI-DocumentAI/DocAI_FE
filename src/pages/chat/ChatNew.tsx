"use client"

import { useEffect, useRef } from "react"  
import { useChat } from "../../context/chat-context"   
import { ChatInput } from "../../components/chat-input"
import ChatSidebar from "../../components/ChatSidebar"

export default function NewChatPage() {
  // const router = useRou()
  const { startNewChat, currentChat, sendMessage } = useChat()
  const hasInitialized = useRef(false)

  // Only start a new chat once when the component mounts
  useEffect(() => {
    if (!hasInitialized.current) {
      startNewChat()
      hasInitialized.current = true
    }
  }, [startNewChat])

  // Only redirect once when we have a valid chat ID
  useEffect(() => {
    if (currentChat && currentChat.id && hasInitialized.current) {
      // router.push(`/chat/${currentChat.id}`)
    }
  }, [currentChat])

  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="flex h-full flex-col items-center justify-center">
            <div className="w-full max-w-2xl px-4">
              <div className="mb-16 text-center">
                <h1 className="text-2xl font-medium">How can I help you today?</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-2xl px-4 pb-8 pt-4 mx-auto">
          <ChatInput onSend={sendMessage} placeholder="Ask anything" />
        </div>
      </div>
    </div>
  )
}
