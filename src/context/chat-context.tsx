"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { 
  getChatSessionDetail, 
  sendMessage as apiSendMessage, // Đổi tên để tránh conflict
  type ChatMessage as APIChatMessage 
} from '../lib/api/chat'

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  tokenCount?: number
}

type Chat = {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  modelName?: string
  isModelActive?: boolean
  canSendMessages?: boolean
}

type ChatContextType = {
  chatHistory: Chat[]
  currentChat: Chat | null
  setCurrentChat: (chat: Chat | null) => void
  sendMessage: (content: string) => Promise<void>
  startNewChat: () => void
  loadChatDetail: (sessionId: string) => Promise<void>
  loading: boolean
  sending: boolean
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
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  // Convert API message format to internal format
  const convertAPIMessage = (apiMessage: APIChatMessage): Message => ({
    id: apiMessage.id,
    role: apiMessage.role === 1 ? "user" : "assistant",
    content: apiMessage.content,
    timestamp: new Date(apiMessage.timestamp),
    tokenCount: apiMessage.tokenCount
  })

  // Load chat detail from API
  const loadChatDetail = useCallback(async (sessionId: string) => {
    try {
      setLoading(true)
      const chatDetail = await getChatSessionDetail(sessionId)
      
      const chat: Chat = {
        id: chatDetail.id,
        title: chatDetail.title,
        messages: chatDetail.messages.map(convertAPIMessage),
        createdAt: new Date(chatDetail.createdAt),
        updatedAt: new Date(chatDetail.lastActiveAt),
        modelName: chatDetail.modelName,
        isModelActive: chatDetail.isModelActive,
        canSendMessages: chatDetail.canSendMessages
      }

      setCurrentChat(chat)
    } catch (error) {
      console.error('Failed to load chat detail:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update interface để match với API response thực tế
  interface SendMessageAPIResponse {
    sessionId: string;
    message: string;
    role: number;
    tokenCount: number;
    timestamp: string;
    modelUsed: string;
  }

  // Use useCallback to prevent unnecessary re-renders
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentChat || sending) return

      // Tạo user message ngay lập tức (optimistic update)
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      }

      // Hiển thị user message ngay
      const chatWithUserMessage = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        updatedAt: new Date(),
      }
      setCurrentChat(chatWithUserMessage)

      try {
        setSending(true)
        
        console.log('Sending message:', { content, sessionId: currentChat.id, modelName: currentChat.modelName })
        
        // Send message to API
        const response = await apiSendMessage({
          message: content,
          sessionId: currentChat.id,
          modelName: currentChat.modelName || ""
        })

        console.log('API Response:', response) // Debug log

        // Xử lý response mới - chỉ có assistant message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.message, // Lấy từ response.message
          timestamp: new Date(response.timestamp),
          tokenCount: response.tokenCount
        }

        console.log('Assistant message:', assistantMessage) // Debug log

        // Add assistant message vào chat
        const updatedChat = {
          ...chatWithUserMessage, // Đã có user message rồi
          messages: [...chatWithUserMessage.messages, assistantMessage],
          updatedAt: new Date(),
        }

        setCurrentChat(updatedChat)

        // Update chat history
        setChatHistory((prev) => prev.map((chat) => (chat.id === currentChat.id ? updatedChat : chat)))
      } catch (error: any) {
        console.error('Failed to send message:', error)
        console.error('Error details:', error.response?.data) // Thêm chi tiết lỗi
        
        // Thêm error message
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: Could not send message. Please try again.`,
          timestamp: new Date(),
        }

        const updatedChat = {
          ...chatWithUserMessage,
          messages: [...chatWithUserMessage.messages, errorMessage],
          updatedAt: new Date(),
        }

        setCurrentChat(updatedChat)
        setChatHistory((prev) => prev.map((chat) => (chat.id === currentChat.id ? updatedChat : chat)))
      } finally {
        setSending(false)
      }
    },
    [currentChat, sending],
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
        loadChatDetail,
        loading,
        sending,
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
