import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  placeholder = "Ask anything",
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className={`relative flex items-end bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm transition-all ${
        disabled ? 'opacity-50' : 'hover:shadow-md focus-within:shadow-md focus-within:border-blue-300'
      }`}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Chat is not available" : placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none border-none outline-none bg-transparent text-base min-h-[40px] max-h-32 py-2 placeholder-gray-400"
          style={{ minHeight: 40, maxHeight: 128 }}
        />
        <button
          type="button"
          className={`ml-3 p-2 rounded-full transition-all ${
            message.trim() && !disabled
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
