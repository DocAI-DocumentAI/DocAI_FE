"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

type Chat = {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

type ChatContextType = {
  chatHistory: Chat[]
  currentChat: Chat | null
  setCurrentChat: (chat: Chat | null) => void
  sendMessage: (content: string) => Promise<void>
  startNewChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Mock data for chat history
const mockChatHistory: Chat[] = [
  {
    id: "chat-1747969878532",
    title: "Tài liệu liên quan tới việc xin visa",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Tôi cần những tài liệu gì để xin visa du học?",
        timestamp: new Date(),
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Để xin visa du học, bạn cần chuẩn bị các tài liệu sau: Hộ chiếu, đơn xin visa, ảnh thẻ, thư mời nhập học, bằng chứng tài chính, và giấy khám sức khỏe.",
        timestamp: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Tài liệu liên quan tới thuế công ty",
    messages: [
      {
        id: "m3",
        role: "user",
        content: "Công ty mới thành lập cần nộp những loại thuế nào?",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Công ty mới thành lập cần nộp các loại thuế: thuế GTGT, thuế thu nhập doanh nghiệp, thuế môn bài, thuế thu nhập cá nhân cho nhân viên, và các khoản bảo hiểm xã hội.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Luật về xuất nhập khẩu hàng hóa",
    messages: [
      {
        id: "m5",
        role: "user",
        content: "Cho tôi biết về các quy định xuất nhập khẩu hàng hóa mới nhất?",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: "m6",
        role: "assistant",
        content:
          "Các quy định xuất nhập khẩu hàng hóa mới nhất bao gồm: thủ tục hải quan điện tử, chứng từ xuất xứ hàng hóa, quy định về kiểm dịch, và các chính sách thuế xuất nhập khẩu theo Nghị định số 134/2016/NĐ-CP.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    title: "Hướng dẫn sử dụng DocsAI",
    messages: [
      {
        id: "m7",
        role: "user",
        content: "Làm thế nào để sử dụng DocsAI hiệu quả?",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "m8",
        role: "assistant",
        content:
          "Để sử dụng DocsAI hiệu quả, bạn nên: 1) Tải lên tài liệu có định dạng rõ ràng, 2) Đặt câu hỏi cụ thể, 3) Sử dụng các lệnh đặc biệt như /search để tìm kiếm trong tài liệu, 4) Lưu các cuộc trò chuyện quan trọng để tham khảo sau.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
]

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatHistory, setChatHistory] = useState<Chat[]>(mockChatHistory)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)

  // Use useCallback to prevent unnecessary re-renders
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentChat) return

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      }

      // Mock assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `This is a response to: "${content}"`,
        timestamp: new Date(),
      }

      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage, assistantMessage],
        updatedAt: new Date(),
      }

      setCurrentChat(updatedChat)

      // Update chat history
      setChatHistory((prev) => prev.map((chat) => (chat.id === currentChat.id ? updatedChat : chat)))
    },
    [currentChat],
  )

  // Use useCallback to prevent unnecessary re-renders
  const startNewChat = useCallback(() => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setChatHistory((prev) => [newChat, ...prev])
    setCurrentChat(newChat)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        chatHistory,
        currentChat,
        setCurrentChat,
        sendMessage,
        startNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
