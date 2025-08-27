import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Plus,
  MessageSquare,
  MoreHorizontal,
  Home,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
  LogOut,
  X,
  HelpCircle,
  Trash2,
  Edit3,
} from "lucide-react";
import {
  getChatSessions,
  ChatSession,
  deleteChatSession,
  renameChatSession,
} from "../lib/api/chat";
import { useChat } from "../context/chat-context";
import { toast } from "react-toastify";
import { api } from "../lib/api/api";
import { createChatboxUserPayload } from "../utils/chatboxPayloadUtils";

interface Characteristic {
  value: string;
  displayName: string;
  isSelected: boolean;
}

interface UserPreferences {
  userId: string;
  userName: string;
  chatbotCharacteristics: string[];
  additionalInfo: string;
  applyToNewChats: boolean;
  hasAnyPreferences: boolean;
  availableCharacteristics: Characteristic[];
}

function ChatSidebar() {
  // Initialize sidebar state based on screen size
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024; // lg breakpoint
    }
    return true;
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customizeLoading, setCustomizeLoading] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  
  // Rename chat popup states
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  
  const [customizeSettings, setCustomizeSettings] = useState({
    userName: "",
    chatbotCharacteristics: [] as string[],
    additionalInfo: "",
  });
  const [availableCharacteristics, setAvailableCharacteristics] = useState<
    Characteristic[]
  >([]);

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // Close chat menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowChatMenu(null);
    };

    if (showChatMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showChatMenu]);

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

  // Handle rename chat session - Open popup
  const handleRenameChat = async (sessionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const chatToRename = chatSessions.find((chat) => chat.id === sessionId);
    if (!chatToRename) return;

    setRenamingChatId(sessionId);
    setNewChatTitle(chatToRename.title);
    setShowRenameModal(true);
    setShowChatMenu(null);
  };

  // Handle save rename from popup
  const handleSaveRename = async () => {
    if (!newChatTitle.trim()) {
      toast.error("Chat title cannot be empty");
      return;
    }

    if (newChatTitle.length > 100) {
      toast.error("Chat title cannot exceed 100 characters");
      return;
    }

    if (!renamingChatId) return;

    try {
      setIsRenaming(true);

      await renameChatSession(renamingChatId, newChatTitle.trim());

      // Update local state
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === renamingChatId
            ? { ...chat, title: newChatTitle.trim() }
            : chat
        )
      );

      setShowRenameModal(false);
      setRenamingChatId(null);
      setNewChatTitle("");
      toast.success("Chat renamed successfully");
    } catch (error: any) {
      console.error("Failed to rename chat session:", error);
      toast.error(
        `Rename failed: ${
          error?.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsRenaming(false);
    }
  };

  // Handle cancel rename
  const handleCancelRename = () => {
    setShowRenameModal(false);
    setRenamingChatId(null);
    setNewChatTitle("");
  };

  // Handle rename key press (Enter to save, Escape to cancel)
  const handleRenameKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveRename();
    } else if (event.key === "Escape") {
      handleCancelRename();
    }
  };

  // Handle delete chat session
  const handleDeleteChat = async (
    sessionId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const chatToDelete = chatSessions.find((chat) => chat.id === sessionId);
    if (!chatToDelete) return;

    // Confirm deletion
    if (
      !window.confirm(
        `Are you sure you want to delete the chat "${chatToDelete.title}"?`
      )
    ) {
      return;
    }

    try {
      setDeletingChatId(sessionId);

      // Call delete API
      await deleteChatSession(sessionId);

      // Remove from local state
      setChatSessions((prev) => prev.filter((chat) => chat.id !== sessionId));

      // Close menu
      setShowChatMenu(null);

      // If currently viewing this chat, navigate to new chat
      const currentChatId = getCurrentChatId();
      if (currentChatId === sessionId) {
        clearCurrentChat();
        navigate("/chat/new");
      }

      toast.success("Chat deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete chat session:", error);
      toast.error(
        `Failed to delete chat: ${
          error?.response?.data?.message || error.message
        }`
      );
    } finally {
      setDeletingChatId(null);
    }
  };

  // Handle chat menu toggle
  const handleChatMenuToggle = (chatId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowChatMenu(showChatMenu === chatId ? null : chatId);
  };

  // Fetch user preferences
  const fetchUserPreferences = async () => {
    try {
      setCustomizeLoading(true);

      const response = await api.get("/chatbox/user/preferences");
      const preferences: UserPreferences = response.data;

      setCustomizeSettings({
        userName: preferences.userName || "",
        chatbotCharacteristics: preferences.chatbotCharacteristics || [],
        additionalInfo: preferences.additionalInfo || "",
      });

      setAvailableCharacteristics(preferences.availableCharacteristics || []);
    } catch (error: any) {
      console.error("Failed to fetch user preferences:", error);
      toast.error("Unable to load personalization settings");

      // Fallback: fetch characteristics separately
      try {
        const characteristicsResponse = await api.get(
          "/chatbox/preferences/characteristics"
        );
        setAvailableCharacteristics(characteristicsResponse.data || []);
      } catch (charError) {
        console.error("Failed to fetch characteristics:", charError);
      }
    } finally {
      setCustomizeLoading(false);
    }
  };

  const handleNewChatClick = () => {
    // If already on new chat, do nothing
    if (location.pathname === "/chat/new") {
      return;
    }
    clearCurrentChat();
    navigate("/chat/new");
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

  // Helper to get chat ID from URL
  const getCurrentChatId = () => {
    const match = location.pathname.match(/\/chat\/(.+)/);
    return match ? match[1] : null;
  };

  const currentChatId = getCurrentChatId();

  // Get user info from localStorage
  const getUserInfo = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  };

  const user = getUserInfo();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCustomizeClick = () => {
    setShowProfileMenu(false);
    setShowCustomizeModal(true);
    fetchUserPreferences(); // Load current preferences when modal opens
  };

  const handleSaveCustomize = async () => {
    try {
      setCustomizeLoading(true);

      const payload = createChatboxUserPayload(customizeSettings);

      await api.patch("/chatbox/user", payload);

      toast.success("Personalization settings saved successfully!");

      // Refetch to verify
      setTimeout(async () => {
        await fetchUserPreferences();
      }, 1000);

      setShowCustomizeModal(false);
    } catch (error: any) {
      console.error("Failed to save preferences:", error);
      toast.error(
        `Failed to save settings: ${
          error?.response?.data?.message || error.message
        }`
      );
    } finally {
      setCustomizeLoading(false);
    }
  };

  // Add validation before saving
  const validateAndSave = async () => {
    await handleSaveCustomize();
  };

  const handleCancelCustomize = () => {
    setShowCustomizeModal(false);
  };

  const handleCharacteristicToggle = (characteristicValue: string) => {
    const isSelected =
      customizeSettings.chatbotCharacteristics.includes(characteristicValue);

    let newCharacteristics;
    if (isSelected) {
      // Remove characteristic
      newCharacteristics = customizeSettings.chatbotCharacteristics.filter(
        (char) => char !== characteristicValue
      );
    } else {
      // Add characteristic - only allow max 2
      if (customizeSettings.chatbotCharacteristics.length >= 2) {
        toast.warning("You can only select up to 2 characteristics");
        return;
      }
      newCharacteristics = [
        ...customizeSettings.chatbotCharacteristics,
        characteristicValue,
      ];
    }
    setCustomizeSettings({
      ...customizeSettings,
      chatbotCharacteristics: newCharacteristics,
    });
  };

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
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-blue-800 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <div
            className={`flex flex-1 items-center ${
              isCollapsed ? "justify-center" : "justify-center lg:justify-start"
            }`}
          >
            {!isCollapsed && (
              <Link to="/" className="flex items-center">
                <img
                  src="/LOGO.png"
                  alt="Docs+AI"
                  className="h-10 w-auto"
                />
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden p-2 rounded-md hover:bg-blue-800 lg:block"
              aria-label="Toggle sidebar collapse"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </button>
          </div>
        </div>

        {/* New chat button */}
        <div className="p-4">
          <button
            onClick={handleNewChatClick}
            className={`flex w-full items-center ${
              isCollapsed
                ? "justify-center px-2 py-2"
                : "justify-center gap-2 px-4 py-2"
            } rounded-md bg-blue-950 text-sm font-medium hover:bg-blue-900 transition-all`}
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
              className={`flex w-full items-center ${
                isCollapsed ? "justify-center" : "justify-start gap-3"
              } rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-blue-800 hover:text-white transition-colors`}
              title="Home"
            >
              <Home size={16} className="flex-shrink-0" />
              {!isCollapsed && "Home"}
            </Link>
            <Link
              to="/document-library"
              className={`flex w-full items-center ${
                isCollapsed ? "justify-center" : "justify-start gap-3"
              } rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-blue-800 hover:text-white transition-colors`}
              title="Document Library"
            >
              <Library size={16} className="flex-shrink-0" />
              {!isCollapsed && "Document Library"}
            </Link>
          </div>
        </div>

        {/* Chat history - Hidden scrollbar */}
        {!isCollapsed && (
          <div
            className="flex-1 overflow-auto"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {loading ? (
              <div className="p-4">
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-blue-800 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4">
                {Object.entries(groupedHistory).map(([groupKey, chats]) => (
                  <div key={groupKey} className="mb-4">
                    <h3 className="mb-2 text-xs font-medium tracking-wider text-blue-300 uppercase">
                      {groupKey}
                    </h3>
                    <div className="space-y-1">
                      {chats.map((chat) => (
                        <div key={chat.id} className="relative">
                          <Link
                            to={`/chat/${chat.id}`}
                            className={classNames(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors group",
                              currentChatId === chat.id
                                ? "bg-blue-800 text-white"
                                : "text-blue-100 hover:bg-blue-800 hover:text-white"
                            )}
                          >
                            <MessageSquare
                              size={16}
                              className="flex-shrink-0"
                            />
                            <span className="flex-1 truncate">
                              {chat.title}
                            </span>
                            <button
                              onClick={(e) => handleChatMenuToggle(chat.id, e)}
                              className="p-1 transition-opacity rounded opacity-0 hover:bg-blue-700 group-hover:opacity-100"
                              disabled={deletingChatId === chat.id}
                            >
                              {deletingChatId === chat.id ? (
                                <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <MoreHorizontal size={14} />
                              )}
                            </button>
                          </Link>

                          {/* Chat Options Menu */}
                          {showChatMenu === chat.id && (
                            <div className="absolute right-0 z-50 py-1 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full min-w-32">
                              <button
                                onClick={(e) => handleRenameChat(chat.id, e)}
                                className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <Edit3 size={14} />
                                Rename
                              </button>
                              <button
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                                disabled={deletingChatId === chat.id}
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer with Profile Menu */}
        <div className="relative p-4 mt-auto border-t border-blue-800">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex w-full items-center ${
              isCollapsed ? "justify-center" : "gap-3"
            } rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-blue-800 transition-colors`}
            title={user?.userName || "User Profile"}
          >
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-blue-700 rounded-full">
              <User size={16} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <div className="font-medium text-white">
                  {user?.userName || "User"}
                </div>
                <div className="text-xs text-blue-300">
                  {user?.email || "user@example.com"}
                </div>
              </div>
            )}
            {!isCollapsed && (
              <MoreHorizontal size={16} className="text-blue-300" />
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />

              <div
                className={`absolute ${
                  isCollapsed ? "left-16 bottom-4" : "left-4 bottom-16"
                } right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-64`}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-900">
                    {user?.userName || "User"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user?.email || "user@example.com"}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/settings/account");
                    }}
                    className="flex items-center w-full gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} />
                    Profile Settings
                  </button>

                  <button
                    onClick={handleCustomizeClick}
                    className="flex items-center w-full gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} />
                    Customize Chat
                  </button>

                  <div className="my-1 border-t border-gray-100"></div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Rename Chat Modal */}
      {showRenameModal && (
        <>
          {/* Modal Overlay */}
          <div className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex items-center justify-center p-4">
            {/* Modal Content */}
            <div className="bg-white rounded-lg max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rename Chat
                </h3>
                <button
                  onClick={handleCancelRename}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                  disabled={isRenaming}
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="mb-4">
                  <label htmlFor="chatTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    New Name
                  </label>
                  <input
                    id="chatTitle"
                    type="text"
                    value={newChatTitle}
                    onChange={(e) => setNewChatTitle(e.target.value)}
                    onKeyDown={handleRenameKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Enter new chat name"
                    maxLength={100}
                    disabled={isRenaming}
                    autoFocus
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {newChatTitle.length}/100 characters
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
                <button
                  onClick={handleCancelRename}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isRenaming}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRename}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isRenaming || !newChatTitle.trim()}
                >
                  {isRenaming && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {isRenaming ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Customize Chat Modal */}
      {showCustomizeModal && (
        <>
          {/* Modal Overlay */}
          <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
            {/* Modal Content */}
            <div className="bg-gray-800 text-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">
                    Customize Docs+AI Chat
                  </h2>
                  <HelpCircle size={20} className="text-gray-400" />
                </div>
                <button
                  onClick={handleCancelCustomize}
                  className="p-2 transition-colors rounded-lg hover:bg-gray-700"
                  disabled={customizeLoading}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <p className="text-sm text-gray-300">
                  Tell us about yourself to receive more accurate and personalized responses
                </p>

                {customizeLoading ? (
                  <div className="py-8 text-center">
                    <div className="w-8 h-8 mx-auto border-b-2 border-white rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-400">Loading settings...</p>
                  </div>
                ) : (
                  <>
                    {/* Name Field */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        What should Docs+AI Chat call you?
                      </label>
                      <input
                        type="text"
                        value={customizeSettings.userName}
                        onChange={(e) =>
                          setCustomizeSettings({
                            ...customizeSettings,
                            userName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter the name you want to be called"
                      />
                    </div>

                    {/* Characteristics */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium">
                          What characteristics should Docs+AI Chat have?
                        </label>
                        <HelpCircle size={16} className="text-gray-400" />
                      </div>
                      <p className="mb-2 text-xs text-gray-400">
                        Choose up to 2 characteristics (
                        {customizeSettings.chatbotCharacteristics.length}/2)
                      </p>

                      {/* Available Characteristics */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {availableCharacteristics.map((characteristic) => {
                          const isSelected =
                            customizeSettings.chatbotCharacteristics.includes(
                              characteristic.value
                            );
                          const isMaxSelected =
                            customizeSettings.chatbotCharacteristics.length >=
                            2;
                          const isDisabled = !isSelected && isMaxSelected;

                          return (
                            <button
                              key={characteristic.value}
                              onClick={() =>
                                handleCharacteristicToggle(characteristic.value)
                              }
                              disabled={isDisabled}
                              className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                                isSelected
                                  ? "bg-blue-600 border-blue-500 text-white"
                                  : isDisabled
                                  ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              {isSelected ? "✓ " : "+ "}
                              {characteristic.displayName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Additional Info Field */}
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Additional Information
                      </label>
                      <textarea
                        value={customizeSettings.additionalInfo}
                        onChange={(e) =>
                          setCustomizeSettings({
                            ...customizeSettings,
                            additionalInfo: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full px-3 py-2 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell us more about yourself or how you want the chat to respond..."
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                <button
                  onClick={handleCancelCustomize}
                  className="px-4 py-2 text-gray-300 transition-colors hover:text-white"
                  disabled={customizeLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={validateAndSave}
                  className="px-6 py-2 font-medium text-gray-900 transition-colors bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={customizeLoading}
                >
                  {customizeLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 bg-white border-b border-gray-200 h-14 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100"
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