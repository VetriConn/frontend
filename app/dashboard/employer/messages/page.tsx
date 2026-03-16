"use client";

import { useState } from "react";
import { HiOutlinePaperAirplane, HiOutlinePaperClip } from "react-icons/hi2";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "James Mitchell",
    role: "Applicant — Warehouse Supervisor",
    avatar: "JM",
    lastMessage: "Thank you for considering my application.",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Patricia Williams",
    role: "Applicant — Logistics Coordinator",
    avatar: "PW",
    lastMessage: "I look forward to hearing from you.",
    unreadCount: 1,
  },
  {
    id: "3",
    name: "David Thompson",
    role: "Applicant — Logistics Coordinator",
    avatar: "DT",
    lastMessage: "Sounds great, I'm available any day next w...",
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      sender: "me",
      text: "Hello James, thank you for applying. Could you share more about your supervisory experience?",
      timestamp: "2026-02-14 08:00",
    },
    {
      id: "m2",
      sender: "them",
      text: "Of course! I managed a team of 15 at my previous warehouse role for 6 years.",
      timestamp: "2026-02-14 14:20",
    },
    {
      id: "m3",
      sender: "them",
      text: "I also have forklift certification and OSHA training.",
      timestamp: "2026-02-15 10:00",
    },
    {
      id: "m4",
      sender: "them",
      text: "Thank you for considering my application.",
      timestamp: "2026-02-15 10:30",
    },
  ],
  "2": [
    {
      id: "m5",
      sender: "me",
      text: "Hi Patricia, your resume looks strong. Are you available for an interview next week?",
      timestamp: "2026-02-13 09:00",
    },
    {
      id: "m6",
      sender: "them",
      text: "I look forward to hearing from you.",
      timestamp: "2026-02-13 11:00",
    },
  ],
  "3": [
    {
      id: "m7",
      sender: "me",
      text: "David, we'd like to schedule a call. What works for you?",
      timestamp: "2026-02-12 10:00",
    },
    {
      id: "m8",
      sender: "them",
      text: "Sounds great, I'm available any day next week.",
      timestamp: "2026-02-12 14:00",
    },
  ],
};

// ─── Page Component ──────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string>("1");
  const [messageInput, setMessageInput] = useState("");

  const selectedConvo = MOCK_CONVERSATIONS.find((c) => c.id === selectedId);
  const messages = selectedId ? MOCK_MESSAGES[selectedId] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        <div
          className="bg-white rounded-xl border border-gray-200 flex overflow-hidden"
          style={{ height: "540px" }}
        >
          {/* ── Left panel — Conversation list ── */}
          <div className="w-72 border-r border-gray-200 flex flex-col shrink-0">
            <div className="overflow-y-auto flex-1">
              {MOCK_CONVERSATIONS.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedId(convo.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selectedId === convo.id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                      {convo.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {convo.name}
                        </p>
                        {convo.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 ml-2">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {convo.role}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {convo.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Right panel — Chat view ── */}
          <div className="flex-1 flex flex-col">
            {selectedConvo ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedConvo.name}
                  </p>
                  <p className="text-xs text-gray-400">{selectedConvo.role}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                          msg.sender === "me"
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            msg.sender === "me"
                              ? "text-white/60"
                              : "text-gray-400"
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input bar */}
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Attach file"
                    >
                      <HiOutlinePaperClip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      className="w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-hover transition-colors"
                      aria-label="Send message"
                    >
                      <HiOutlinePaperAirplane className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
