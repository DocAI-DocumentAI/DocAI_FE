"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getChatSessions } from "../../lib/api/chat"
import ChatSidebar from "../../components/ChatSidebar"

export default function ChatIndexPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const redirectToFirstChat = async () => {
      try {
        setLoading(true)
        const sessions = await getChatSessions()
        if (sessions && sessions.length > 0) {
          // Redirect đến chat đầu tiên trong danh sách
          navigate(`/chat/${sessions[0].id}`, { replace: true })
        } else {
          // Nếu không có chat nào, redirect đến new chat
          navigate('/chat/new', { replace: true })
        }
      } catch (error) {
        console.error('Failed to fetch chat sessions:', error)
        // Fallback đến new chat nếu có lỗi
        navigate('/chat/new', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    redirectToFirstChat()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex h-screen">
        <ChatSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 pt-14 lg:pt-0">
          <p className="text-gray-500">Loading chats...</p>
        </div>
      </div>
    )
  }

  return null // Component này chỉ để redirect
}