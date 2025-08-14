import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Plus, MessageSquare, MoreHorizontal, Home, Library, PanelLeftClose, PanelLeftOpen, Settings, User, LogOut, X, HelpCircle } from "lucide-react";
import { getChatSessions, ChatSession } from "../lib/api/chat";
import { useChat } from "../context/chat-context"; 
import { toast } from "react-toastify";
import { api } from "../lib/api/api";

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
    if (typeof window !== 'undefined') {
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
  const [customizeSettings, setCustomizeSettings] = useState({
    userName: "",
    chatbotCharacteristics: [] as string[],
    additionalInfo: "",
    applyToNewChats: false
  });
  const [availableCharacteristics, setAvailableCharacteristics] = useState<Characteristic[]>([]);
  
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

  // Fetch user preferences
  const fetchUserPreferences = async () => {
    try {
      setCustomizeLoading(true);
      console.log('=== FETCHING USER PREFERENCES ===');
      
      const response = await api.get('/chatbox/user/preferences');
      const preferences: UserPreferences = response.data;
      
      console.log('Fetched preferences:', preferences);
      console.log('Fetched characteristics:', preferences.chatbotCharacteristics);
      console.log('Fetched characteristics count:', preferences.chatbotCharacteristics?.length);
      
      setCustomizeSettings({
        userName: preferences.userName || "",
        chatbotCharacteristics: preferences.chatbotCharacteristics || [],
        additionalInfo: preferences.additionalInfo || "",
        applyToNewChats: preferences.applyToNewChats || false
      });
      
      setAvailableCharacteristics(preferences.availableCharacteristics || []);
      
      console.log('=== END FETCH DEBUG ===');
    } catch (error: any) {
      console.error("Failed to fetch user preferences:", error);
      toast.error("Không thể tải thông tin cá nhân hóa");
      
      // Fallback: fetch characteristics separately
      try {
        const characteristicsResponse = await api.get('/chatbox/preferences/characteristics');
        setAvailableCharacteristics(characteristicsResponse.data || []);
      } catch (charError) {
        console.error("Failed to fetch characteristics:", charError);
      }
    } finally {
      setCustomizeLoading(false);
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
 
      // Tạo payload mới để đảm bảo không có reference issues
      console.log(123,customizeSettings.chatbotCharacteristics);
      
      const payload = {
        userName: customizeSettings.userName || "",
        chatbotCharacteristics: [...customizeSettings.chatbotCharacteristics], // Clone array
        additionalInfo: customizeSettings.additionalInfo || "",
        applyToNewChats: customizeSettings.applyToNewChats
      };

      console.log('Payload object:', payload);
      console.log('Payload characteristics:', payload.chatbotCharacteristics);
      console.log('Payload characteristics length:', payload.chatbotCharacteristics.length);
      console.log('Stringified payload:', JSON.stringify(payload, null, 2));

      // Log trước khi gọi API
      console.log('About to call API with payload...');

      const response = await api.patch('/chatbox/user', payload);
      
      console.log('API Response status:', response.status);
      console.log('API Response data:', response.data);
      console.log('=== END SAVE DEBUG ===');
      
      toast.success("Đã lưu cài đặt cá nhân hóa thành công!");
      
      // Fetch lại để verify
      setTimeout(async () => {
        console.log('Fetching preferences after save to verify...');
        await fetchUserPreferences();
      }, 1000);
      
      setShowCustomizeModal(false);
    } catch (error: any) {
      console.error("Failed to save preferences:", error);
      console.log('Error response data:', error?.response?.data);
      console.log('Error response status:', error?.response?.status);
      console.log('Error full response:', error?.response);
      toast.error(`Lưu cài đặt thất bại: ${error?.response?.data?.message || error.message}`);
    } finally {
      setCustomizeLoading(false);
    }
  };

  // Thêm validation trước khi save
  const validateAndSave = async () => {
   
    await handleSaveCustomize();
  };

 
  const handleCancelCustomize = () => {
    setShowCustomizeModal(false);
  };

  const handleCharacteristicToggle = (characteristicValue: string) => { 
    const isSelected = customizeSettings.chatbotCharacteristics.includes(characteristicValue);
    
    let newCharacteristics;
    if (isSelected) {
      // Remove characteristic
      newCharacteristics = customizeSettings.chatbotCharacteristics.filter(
        char => char !== characteristicValue
      );
    } else {
      // Add characteristic
      newCharacteristics = [...customizeSettings.chatbotCharacteristics, characteristicValue];
    } 
    setCustomizeSettings({
      ...customizeSettings,
      chatbotCharacteristics: newCharacteristics
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
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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

        {/* Chat history - Ẩn thanh cuộn */}
        {!isCollapsed && (
          <div 
            className="flex-1 overflow-auto"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none', 
            }}
          >
           
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

        {/* Footer với Profile Menu */}
        <div className="mt-auto border-t border-blue-800 p-4 relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex w-full items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-blue-800 transition-colors`}
            title={user?.userName || "User Profile"}
          >
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={16} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <div className="font-medium text-white">{user?.userName || "User"}</div>
                <div className="text-xs text-blue-300">{user?.email || "user@example.com"}</div>
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
              
              <div className={`absolute ${isCollapsed ? 'left-16 bottom-4' : 'left-4 bottom-16'} right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-64`}>
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-900">{user?.userName || "User"}</div>
                  <div className="text-sm text-gray-500">{user?.email || "user@example.com"}</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/settings/account');
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} />
                    Profile Settings
                  </button>
                  
                  <button
                    onClick={handleCustomizeClick}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings size={16} />
                    Tùy chỉnh chat
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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

      {/* Customize ChatGPT Modal */}
      {showCustomizeModal && (
        <>
          {/* Modal Overlay */}
          <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
            {/* Modal Content */}
            <div className="bg-gray-800 text-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">Tùy chỉnh ChatGPT</h2>
                  <HelpCircle size={20} className="text-gray-400" />
                </div>
                <button
                  onClick={handleCancelCustomize}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={customizeLoading}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <p className="text-gray-300 text-sm">
                  Hãy giới thiệu bản thân để nhận được các phản hồi chính xác và phù hợp hơn với bạn
                </p>

                {customizeLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="mt-2 text-gray-400">Đang tải cài đặt...</p>
                  </div>
                ) : (
                  <>
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        ChatGPT nên gọi bạn là gì?
                      </label>
                      <input
                        type="text"
                        value={customizeSettings.userName}
                        onChange={(e) => setCustomizeSettings({...customizeSettings, userName: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập tên bạn muốn ChatGPT gọi"
                      />
                    </div>

                    {/* Characteristics */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium">
                          ChatGPT nên có những đặc điểm gì?
                        </label>
                        <HelpCircle size={16} className="text-gray-400" />
                      </div>
                      
                      {/* Available Characteristics */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {availableCharacteristics.map((characteristic) => {
                          const isSelected = customizeSettings.chatbotCharacteristics.includes(characteristic.value); 
                          return (
                            <button
                              key={characteristic.value}
                              onClick={() => handleCharacteristicToggle(characteristic.value)}
                              className={`px-3 py-1 border rounded-full text-sm transition-colors ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-500 text-white' 
                                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}{characteristic.displayName}
                            </button>
                          );
                        })}
                      </div>

                 
                    </div>

                    {/* Additional Info Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Thông tin bổ sung
                      </label>
                      <textarea
                        value={customizeSettings.additionalInfo}
                        onChange={(e) => setCustomizeSettings({...customizeSettings, additionalInfo: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Hãy mô tả thêm về bản thân hoặc cách bạn muốn ChatGPT phản hồi..."
                      />
                    </div>

                    {/* Toggle for new chats */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Áp dụng cho các đoạn chat mới</span>
                      <button
                        onClick={() => setCustomizeSettings({...customizeSettings, applyToNewChats: !customizeSettings.applyToNewChats})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          customizeSettings.applyToNewChats ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            customizeSettings.applyToNewChats ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                <button
                  onClick={handleCancelCustomize}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  disabled={customizeLoading}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={validateAndSave} // Thay vì handleSaveCustomize
                  className="px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={customizeLoading}
                >
                  {customizeLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
