import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Plus, MessageSquare, MoreHorizontal, Home, Library, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { getChatSessions, ChatSession } from "../lib/api/chat";
import { useChat } from "../context/chat-context";

function ChatSidebar() {
  // Initialize sidebar state based on screen size
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024; // lg breakpoint
    }
    return true;
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCurrentChat } = useChat();

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false); // Auto-close on mobile
        setIsCollapsed(false); // Reset collapse state on mobile
      } else {
        setIsOpen(true); // Auto-open on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch chat sessions on component mount
  useEffect(() => {
    fetchChatSessions();
  }, []);

  // Refresh chat sessions when location changes from /chat/new to /chat/:id
  useEffect(() => {
    if (
      location.pathname.match(/^\/chat\/[^\/]+$/) &&
      !location.pathname.includes("/new")
    ) {
      fetchChatSessions();
    }
  }, [location.pathname]);

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

  const handleNewChatClick = () => {
    clearCurrentChat();
    navigate('/chat/new');
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
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-blue-900 text-white transition-all duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:z-0 lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "w-72"
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
          <div className={`flex flex-1 items-center ${isCollapsed ? 'justify-center' : 'justify-center lg:justify-start'}`}>
            {!isCollapsed && (
              <Link to="/" className="text-2xl font-medium">
                Docs<span className="text-blue-300">+</span>AI
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-md p-2 hover:bg-blue-800 hidden lg:block"
              aria-label="Toggle sidebar collapse"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>
        </div>

        {/* New chat button */}
        <div className="p-4">
          <button
            onClick={handleNewChatClick}
            className={`flex w-full items-center ${isCollapsed ? 'justify-center px-2 py-2' : 'justify-center gap-2 px-4 py-2'} rounded-md bg-blue-950 text-sm font-medium hover:bg-blue-900 transition-all`}
            title="New chat"
          >
            <Plus size={16} />
            {!isCollapsed && "New chat"}
          </button>
        </div>

        {/* Navigation buttons */}
        <div className="px-4 pb-4">
          <div className="space-y-2">
            <Link
              to="/"
              className={`flex w-full items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-blue-800 hover:text-white transition-colors`}
              title="Home"
            >
              <Home size={16} className="flex-shrink-0" />
              {!isCollapsed && "Home"}
            </Link>
            <Link
              to="/document-library"
              className={`flex w-full items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-blue-800 hover:text-white transition-colors`}
              title="Document Library"
            >
              <Library size={16} className="flex-shrink-0" />
              {!isCollapsed && "Document Library"}
            </Link>
          </div>
        </div>

        {/* Chat history */}
        {!isCollapsed && (
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-blue-800 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4">
                {Object.entries(groupedHistory).map(([groupKey, chats]) => (
                  <div key={groupKey} className="mb-4">
                    <h3 className="text-xs font-medium text-blue-300 mb-2 uppercase tracking-wider">
                      {groupKey}
                    </h3>
                    <div className="space-y-1">
                      {chats.map((chat) => (
                        <Link
                          key={chat.id}
                          to={`/chat/${chat.id}`}
                          className={classNames(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            currentChatId === chat.id
                              ? "bg-blue-800 text-white"
                              : "text-blue-100 hover:bg-blue-800 hover:text-white"
                          )}
                        >
                          <MessageSquare size={16} className="flex-shrink-0" />
                          <span className="flex-1 truncate">{chat.title}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Handle chat options
                            }}
                            className="p-1 rounded hover:bg-blue-700"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto border-t border-blue-800 p-4"></div>
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
        <div className="flex items-center gap-2"></div>
      </div>
    </>
  );
}

export default ChatSidebar;
