import { useState, useRef, KeyboardEvent } from "react";
import {  FileText, Mic, Send } from "lucide-react";

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
      <div className={`relative flex items-end bg-white rounded-2xl border border-gray-200 px-4 py-2 shadow-sm ${
        disabled ? 'opacity-50' : ''
      }`}>
        <button
          type="button"
          className="mr-2 text-gray-400 hover:text-blue-500"
          disabled={disabled}
        >
          <FileText size={20} />
        </button>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Chat is not available" : placeholder}
          rows={2}
          disabled={disabled}
          className="flex-1 resize-none border-none outline-none bg-transparent text-base min-h-[48px] max-h-32 py-2"
          style={{ minHeight: 48, maxHeight: 128 }}
        />
        <button
          type="button"
          className="ml-2 text-gray-400 hover:text-blue-500"
          onClick={handleSend}
          disabled={disabled}
        >
          {/* <Send size={22} /> */}
        </button>
        <button
          type="button"
          className="ml-2 text-gray-400 hover:text-blue-500"
          disabled={disabled}
        >
          <Mic size={20} />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
