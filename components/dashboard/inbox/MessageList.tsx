import React from "react";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { Avatar } from "@/components/ui/Avatar";
import { formatTime } from "@/lib/date-utils";
import { safeHttpUrl } from "@/lib/safe-url";

import { Message } from "@/types/inbox";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  userAvatar?: string | null;
  userName?: string;
  themAvatar?: string | null;
  themName?: string;
}

export function MessageList({
  messages,
  isLoading,
  messagesEndRef,
  userAvatar,
  userName = "You",
  themAvatar,
  themName = "Them",
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4 bg-gray-50 custom-scrollbar">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-gray-400">Loading messages...</p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
        >
          {msg.sender === "them" && (
            <Avatar
              src={themAvatar}
              name={themName}
              size={32}
              className="mt-1 bg-gray-200 text-gray-700"
            />
          )}

          <div
            className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.sender === "me"
                ? "bg-primary text-white rounded-br-sm"
                : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {msg.text}
            </p>
            {safeHttpUrl(msg.attachmentUrl) && (
              <div className="mt-3">
                <a
                  href={safeHttpUrl(msg.attachmentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-xs font-medium ${
                    msg.sender === "me"
                      ? "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-primary"
                  }`}
                >
                  <HiOutlineDocumentText className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">
                    {msg.attachmentName || "View attachment"}
                  </span>
                </a>
              </div>
            )}
            <p
              className={`text-[10px] mt-1.5 ${
                msg.sender === "me" ? "text-white/70" : "text-gray-400"
              }`}
            >
              {formatTime(msg.timestamp)}
            </p>
          </div>

          {msg.sender === "me" && (
            <Avatar
              src={userAvatar}
              name={userName}
              size={32}
              className="mt-1 bg-primary/20 text-primary border border-primary/10"
            />
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />

      {!isLoading && messages.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-gray-400">
            No messages yet. Start the conversation!
          </p>
        </div>
      )}
    </div>
  );
}
