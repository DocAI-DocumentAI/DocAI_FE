import React from "react";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => (
  <div
    className={`mb-4 flex ${role === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`rounded-lg px-4 py-2 max-w-[70%] ${
        role === "user"
          ? "text-gray-900 border border-gray-200"
          : " text-gray-900"
      }`}
    >
      {content}
    </div>
  </div>
);

export default ChatMessage; 