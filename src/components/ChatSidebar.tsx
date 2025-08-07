"use client";

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, FileText, Plus, Home } from "lucide-react";
import { getChatSessions, ChatSession } from "../lib/api/chat";
import NewChatModal from "./NewChatModal";

function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch chat sessions on component mount
  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      setLoading(true);
      const sessions = await getChatSessions();
      setChatSessions(sessions);
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatCreated = (chatId: string) => {
    // Refresh chat sessions list
    fetchChatSessions();
    // Navigate to new chat
    navigate(`/chat/${chatId}`);
  };

  // Group chat sessions by date
  const groupedHistory = chatSessions.reduce(
    (groups: Record<string, ChatSession[]>, chat) => {
      const date = new Date(chat.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey;
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else {
        groupKey = `${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}`;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(chat);
      return groups;
    },
    {}
  );

  // Helper function to conditionally join classes
  const classNames = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(" ");
  };

  // Helper để lấy chat ID từ URL
  const getCurrentChatId = () => {
    const match = location.pathname.match(/\/chat\/(.+)/);
    return match ? match[1] : null;
  };

  const currentChatId = getCurrentChatId();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 sidebar-overlay lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-blue-900 text-white transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:z-0 lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-md p-2 hover:bg-blue-800 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex flex-1 items-center justify-center lg:justify-start">
            <Link to="/" className="text-2xl font-medium">
              Docs<span className="text-blue-300">+</span>AI
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md p-2 hover:bg-blue-800"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              className="rounded-md p-2 hover:bg-blue-800"
              aria-label="Documents"
            >
              <FileText size={20} />
            </button>
          </div>
        </div>

        {/* New chat button */}
        <div className="p-4">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-950 px-4 py-2 text-sm font-medium hover:bg-blue-900"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="text-blue-300">Loading...</div>
            </div>
          ) : (
            Object.entries(groupedHistory).map(([date, chats]) => (
              <div key={date} className="px-2">
                <h3 className="mb-1 mt-3 px-2 text-xs font-medium text-blue-300">
                  {date}
                </h3>
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <Link
                      key={chat.id}
                      to={`/chat/${chat.id}`}
                      className={classNames(
                        "block truncate rounded-md px-2 py-2 text-sm hover:bg-blue-800",
                        currentChatId === chat.id && "bg-blue-800"
                      )}
                      title={chat.title}
                    >
                      {chat.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* User profile */}
        <div className="mt-auto border-t border-blue-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium">Thomas D</p>
              <p className="truncate text-xs text-blue-300">
                thomasd1995@gmail.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md p-2 hover:bg-gray-100"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label="Documents"
          >
            <FileText size={20} />
          </button>
          <Link
            to="/"
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label="Home"
          >
            <Home size={20} />
          </Link>
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </>
  );
}

export default ChatSidebar;
