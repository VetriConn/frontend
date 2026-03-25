"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import {
  getEmployerMessageThreads,
  getEmployerThreadMessages,
  sendEmployerAttachmentMessage,
  sendEmployerMessage,
} from "@/lib/api";
import { getInitials } from "@/lib/initials";
import { HiOutlinePaperAirplane, HiOutlinePaperClip } from "react-icons/hi2";
import type { EmployerThreadMessage } from "@/types/api";

function formatTimestamp(value?: string) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString();
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function MessagesPage() {
  const {
    data: threads = [],
    isLoading,
    error,
    mutate: mutateThreads,
  } = useSWR("employer-message-threads", getEmployerMessageThreads);

  const [selectedId, setSelectedId] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [sendError, setSendError] = useState<string>("");
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const resolvedSelectedId =
    selectedId || (threads.length > 0 ? threads[0].application_id : "");

  const {
    data: threadData,
    isLoading: isThreadLoading,
    mutate: mutateThread,
  } = useSWR(
    resolvedSelectedId
      ? ["employer-thread-messages", resolvedSelectedId]
      : null,
    () => getEmployerThreadMessages(resolvedSelectedId),
  );

  const conversations = useMemo(() => {
    return threads.map((thread) => {
      const lastMessage =
        thread.last_message?.content?.trim() ||
        thread.additional_info?.trim() ||
        "No messages yet";

      return {
        id: thread.application_id,
        name: thread.applicant.full_name,
        role: `Applicant — ${thread.job?.role || "Job Posting"}`,
        avatar: getInitials(thread.applicant.full_name),
        lastMessage,
        appliedAt: thread.last_message?.createdAt || thread.applied_at,
        email: thread.applicant.email,
        phone: thread.applicant.phone,
        selectedSkills: thread.selected_skills || [],
        additionalInfo: thread.additional_info || "",
      };
    });
  }, [threads]);

  const selectedConvo = conversations.find((c) => c.id === resolvedSelectedId);

  const messages = useMemo(() => {
    if (!selectedConvo) return [];

    const threadMessages: EmployerThreadMessage[] = threadData?.messages || [];

    if (threadMessages.length > 0) {
      return threadMessages.map((msg) => ({
        id: msg._id,
        sender: msg.sender === "employer" ? ("me" as const) : ("them" as const),
        text: msg.content,
        attachmentUrl: msg.attachment_url,
        attachmentName: msg.attachment_name,
        timestamp: formatTimestamp(msg.createdAt),
      }));
    }

    const base = [];
    if (selectedConvo.additionalInfo.trim()) {
      base.push({
        id: `${selectedConvo.id}-app`,
        sender: "them" as const,
        text: selectedConvo.additionalInfo.trim(),
        attachmentUrl: undefined,
        attachmentName: undefined,
        timestamp: formatTimestamp(selectedConvo.appliedAt),
      });
    }
    if (selectedConvo.selectedSkills.length > 0) {
      base.push({
        id: `${selectedConvo.id}-skills`,
        sender: "them" as const,
        text: `Top skills: ${selectedConvo.selectedSkills.join(", ")}`,
        attachmentUrl: undefined,
        attachmentName: undefined,
        timestamp: formatTimestamp(selectedConvo.appliedAt),
      });
    }

    return base;
  }, [selectedConvo, threadData]);

  const handleSend = async () => {
    if (!selectedConvo || !messageInput.trim() || isSending) return;
    setSendError("");
    setIsSending(true);

    try {
      await sendEmployerMessage(selectedConvo.id, messageInput.trim());
      setMessageInput("");
      await Promise.all([mutateThread(), mutateThreads()]);
    } catch (err) {
      setSendError(
        err instanceof Error
          ? err.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleAttachmentChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!selectedConvo || !file || isUploadingAttachment) return;

    setSendError("");
    setIsUploadingAttachment(true);
    try {
      await sendEmployerAttachmentMessage(
        selectedConvo.id,
        file,
        messageInput.trim() || undefined,
      );
      setMessageInput("");
      await Promise.all([mutateThread(), mutateThreads()]);
    } catch (err) {
      setSendError(
        err instanceof Error
          ? err.message
          : "Unable to send attachment. Please try again.",
      );
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-225 mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        {isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-500 mb-4">
            Loading applicant conversations...
          </div>
        )}

        {error && (
          <div className="bg-white rounded-lg border border-red-200 p-4 text-sm text-red-600 mb-4">
            Unable to load messages right now. Please refresh and try again.
          </div>
        )}

        <div
          className="bg-white rounded-xl border border-gray-200 flex overflow-hidden"
          style={{ height: "540px" }}
        >
          {/* ── Left panel — Conversation list ── */}
          <div className="w-72 border-r border-gray-200 flex flex-col shrink-0">
            <div className="overflow-y-auto flex-1">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedId(convo.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    resolvedSelectedId === convo.id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {convo.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {convo.name}
                        </p>
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
              {!isLoading && conversations.length === 0 && (
                <div className="p-4 text-xs text-gray-400">
                  No applicant messages yet.
                </div>
              )}
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
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedConvo.email} • {selectedConvo.phone}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {isThreadLoading && (
                    <p className="text-sm text-gray-400">Loading messages...</p>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-3/4 rounded-xl px-4 py-2.5 ${
                          msg.sender === "me"
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        {msg.attachmentUrl && (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block mt-2 text-xs underline ${
                              msg.sender === "me"
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                          >
                            {msg.attachmentName || "Open attachment"}
                          </a>
                        )}
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
                  {!isThreadLoading && messages.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No messages yet. Start the conversation with this
                      applicant.
                    </p>
                  )}
                </div>

                {/* Input bar */}
                <div className="px-4 py-3 border-t border-gray-200">
                  {sendError && (
                    <p className="text-xs text-red-600 mb-2">{sendError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Attach file"
                      onClick={() => attachmentInputRef.current?.click()}
                      disabled={isUploadingAttachment}
                    >
                      <HiOutlinePaperClip className="w-5 h-5" />
                    </button>
                    <input
                      ref={attachmentInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAttachmentChange}
                    />
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      className="w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                      onClick={handleSend}
                      disabled={
                        isSending ||
                        isUploadingAttachment ||
                        !messageInput.trim()
                      }
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
