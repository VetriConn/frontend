"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import {
  getEmployerMessageThreads,
  getEmployerThreadMessages,
  sendEmployerAttachmentMessage,
  sendEmployerMessage,
} from "@/lib/api";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ConversationList } from "@/components/dashboard/inbox/ConversationList";
import { ChatHeader } from "@/components/dashboard/inbox/ChatHeader";
import { MessageList } from "@/components/dashboard/inbox/MessageList";
import { ChatInput } from "@/components/dashboard/inbox/ChatInput";
import type { Conversation, Message } from "@/types/inbox";
import type { EmployerThreadMessage } from "@/types/api";

export default function EmployerMessagesPage() {
  const { userProfile } = useUserProfile();

  // ─── Threads ──────────────────────────────────────────────────────────────
  const {
    data: threads = [],
    isLoading: threadsLoading,
    error: threadsError,
    mutate: mutateThreads,
  } = useSWR("employer-message-threads", getEmployerMessageThreads);

  const [selectedId, setSelectedId] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [sendError, setSendError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resolvedSelectedId =
    selectedId || (threads.length > 0 ? threads[0].application_id : "");

  // ─── Active thread ────────────────────────────────────────────────────────
  const {
    data: threadData,
    isLoading: threadLoading,
    mutate: mutateThread,
  } = useSWR(
    resolvedSelectedId ? ["employer-thread", resolvedSelectedId] : null,
    () => getEmployerThreadMessages(resolvedSelectedId),
  );

  // ─── Derived data ─────────────────────────────────────────────────────────
  type EmployerConversation = Conversation & {
    email?: string;
    phone?: string;
    selectedSkills: string[];
    additionalInfo: string;
  };

  const conversations: EmployerConversation[] = useMemo(
    () =>
      threads.map((thread) => ({
        id: thread.application_id,
        name: thread.applicant.full_name,
        subtitle: `Applicant — ${thread.job?.role || "Job Posting"}`,
        avatar: (thread.applicant as any)?.picture || null,
        lastMessage:
          (typeof thread.last_message === "string"
            ? thread.last_message
            : (thread.last_message as any)?.content)?.trim() ||
          thread.additional_info?.trim() ||
          "No messages yet",
        appliedAt:
          (typeof thread.last_message === "object" && thread.last_message
            ? thread.last_message.createdAt
            : thread.applied_at) || "",
        email: thread.applicant.email,
        phone: thread.applicant.phone,
        selectedSkills: thread.selected_skills || [],
        additionalInfo: thread.additional_info || "",
      })),
    [threads],
  );

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  const selectedConvo = conversations.find(
    (c) => c.id === resolvedSelectedId,
  );

  const messages: Message[] = useMemo(() => {
    if (!selectedConvo) return [];

    const threadMessages: EmployerThreadMessage[] =
      threadData?.messages || [];

    if (threadMessages.length > 0) {
      return threadMessages.map((msg) => ({
        id: msg._id,
        sender: msg.sender === "employer" ? "me" : "them",
        text: msg.content,
        attachmentUrl: msg.attachment_url,
        attachmentName: msg.attachment_name,
        timestamp: msg.createdAt,
      }));
    }

    // Synthesize a starter view from the application metadata so the
    // employer has context before any real messages are exchanged.
    const base: Message[] = [];
    if (selectedConvo.additionalInfo.trim()) {
      base.push({
        id: `${selectedConvo.id}-app`,
        sender: "them",
        text: selectedConvo.additionalInfo.trim(),
        timestamp: selectedConvo.appliedAt,
      });
    }
    if (selectedConvo.selectedSkills.length > 0) {
      base.push({
        id: `${selectedConvo.id}-skills`,
        sender: "them",
        text: `Top skills: ${selectedConvo.selectedSkills.join(", ")}`,
        timestamp: selectedConvo.appliedAt,
      });
    }
    return base;
  }, [selectedConvo, threadData]);

  // ─── Send / attach ────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!resolvedSelectedId || isSending || isUploadingAttachment) return;
    const trimmed = messageInput.trim();
    if (!trimmed && !selectedFile) return;
    setSendError("");

    try {
      if (selectedFile) {
        setIsUploadingAttachment(true);
        await sendEmployerAttachmentMessage(
          resolvedSelectedId,
          selectedFile,
          trimmed || undefined,
        );
      } else {
        setIsSending(true);
        await sendEmployerMessage(resolvedSelectedId, trimmed);
      }
      setMessageInput("");
      setSelectedFile(null);
      await Promise.all([mutateThread(), mutateThreads()]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setSendError(
        err instanceof Error
          ? err.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setIsSending(false);
      setIsUploadingAttachment(false);
    }
  };

  const handleAttachmentChange = (file: File) => {
    setSendError("");
    setSelectedFile(file);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [resolvedSelectedId, messages.length]);

  return (
    <RoleGuard allowedRoles={["employer"]}>
      <div className="h-[calc(100vh-73px)] flex flex-col bg-gray-50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col px-4 md:px-6 py-4 md:py-6">
          {/* Header */}
          <div className="mb-4 md:mb-6 shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Messages
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Communicate with job applicants
            </p>
          </div>

          {/* Loading / error states */}
          {threadsLoading && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-500 mb-4 shrink-0">
              Loading conversations…
            </div>
          )}
          {threadsError && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-sm text-red-600 mb-4 shrink-0">
              Unable to load messages. Please refresh and try again.
            </div>
          )}

          {/* Main chat container */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex min-h-0">
            <ConversationList
              conversations={filteredConversations}
              selectedId={resolvedSelectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setSelectedFile(null);
                setSendError("");
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => setSearchQuery("")}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30 h-full">
              {selectedConvo ? (
                <>
                  <ChatHeader
                    name={selectedConvo.name}
                    subtitle={selectedConvo.subtitle}
                    email={selectedConvo.email}
                    phone={selectedConvo.phone}
                  />

                  {threadLoading && messages.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-sm text-gray-400">
                        Loading messages…
                      </p>
                    </div>
                  )}

                  <MessageList
                    messages={messages}
                    messagesEndRef={messagesEndRef}
                    userName={userProfile?.full_name || "Employer"}
                    userAvatar={userProfile?.employer_profile?.company_logo || userProfile?.employer_profile?.logo_url || userProfile?.picture}
                    themName={selectedConvo.name}
                    themAvatar={selectedConvo.avatar}
                  />

                  <ChatInput
                    messageInput={messageInput}
                    setMessageInput={setMessageInput}
                    onSend={handleSend}
                    onAttachmentChange={handleAttachmentChange}
                    isSending={isSending}
                    isUploadingAttachment={isUploadingAttachment}
                    sendError={sendError}
                    selectedFile={selectedFile}
                    onClearFile={() => setSelectedFile(null)}
                  />
                </>
              ) : threadsLoading ? (
                <div className="flex-1" />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl text-gray-300">💬</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Your Messages
                  </h3>
                  <p className="text-gray-500 max-w-xs">
                    Select a conversation from the sidebar to view your
                    messages and contact applicants.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
