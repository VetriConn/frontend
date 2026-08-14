import React from "react";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineInbox,
} from "react-icons/hi2";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/date-utils";
import { getInitials } from "@/lib/initials";

import { Conversation } from "@/types/inbox";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  onClearSearch,
  isLoading,
}: ConversationListProps) {
  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col h-full bg-white">
      {/* Search/Filter Header */}
      <div className="p-4 border-b border-gray-200 shrink-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineMagnifyingGlass className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {conversations.map((convo) => (
          <button
            key={convo.id}
            onClick={() => onSelect(convo.id)}
            className={`w-full text-left px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              selectedId === convo.id
                ? "bg-primary/5 border-l-4 border-l-primary"
                : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar
                src={convo.avatar}
                name={convo.name}
                size={44}
                className="ring-2 ring-white"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p
                    className={`text-sm truncate ${convo.unreadCount && convo.unreadCount > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-900"}`}
                  >
                    {convo.name}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatRelativeTime(convo.appliedAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">
                  {convo.subtitle}
                </p>
                <p
                  className={`text-xs truncate line-clamp-2 ${convo.unreadCount && convo.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-600"}`}
                >
                  {convo.lastMessage}
                </p>
              </div>
            </div>
          </button>
        ))}

        {!isLoading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiOutlineInbox className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              No conversations found
            </p>
            <p className="text-xs text-gray-500">
              Your messages will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
