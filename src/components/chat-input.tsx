import React, { useState, useRef } from "react";
import { FileText, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  placeholder = "Ask anything",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex items-end bg-white rounded-2xl border border-gray-200 px-4 py-2 shadow-sm">
        <button
          type="button"
          className="mr-2 text-gray-400 hover:text-blue-500"
        >
          <FileText size={20} />
        </button>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="flex-1 resize-none border-none outline-none bg-transparent text-base min-h-[48px] max-h-32 py-2"
          style={{ minHeight: 48, maxHeight: 128 }}
        />
        <button
          type="button"
          className="ml-2 text-gray-400 hover:text-blue-500"
          onClick={handleSend}
        >
          {/* <Send size={22} /> */}
        </button>
        <button
          type="button"
          className="ml-2 text-gray-400 hover:text-blue-500"
        >
          <Mic size={20} />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
