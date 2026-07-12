"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  getJobSeekerMessageThreads,
  getJobSeekerThreadMessages,
  sendJobSeekerMessage,
  sendJobSeekerAttachmentMessage,
} from "@/lib/api";
import { ConversationList } from "@/components/dashboard/inbox/ConversationList";
import { ChatHeader } from "@/components/dashboard/inbox/ChatHeader";
import { MessageList } from "@/components/dashboard/inbox/MessageList";
import { ChatInput } from "@/components/dashboard/inbox/ChatInput";
import type { Conversation, Message } from "@/types/inbox";

export default function JobSeekerInboxPage() {
  const { userProfile } = useUserProfile();

  // ─── Threads (left rail) ──────────────────────────────────────────────────
  const {
    data: threads = [],
    isLoading: threadsLoading,
    error: threadsError,
    mutate: mutateThreads,
  } = useSWR("job-seeker-message-threads", getJobSeekerMessageThreads);

  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [sendError, setSendError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resolvedSelectedId =
    selectedId || (threads.length > 0 ? threads[0].application_id : "");

  // ─── Active thread messages ───────────────────────────────────────────────
  const {
    data: threadData,
    isLoading: threadLoading,
    mutate: mutateThread,
  } = useSWR(
    resolvedSelectedId ? ["job-seeker-thread", resolvedSelectedId] : null,
    () => getJobSeekerThreadMessages(resolvedSelectedId),
  );

  // ─── Derived data ─────────────────────────────────────────────────────────
  const conversations: Conversation[] = useMemo(
    () =>
      threads.map((t) => ({
        id: t.application_id,
        name: (t as any).company_name || t.employer?.company_name || "Employer",
        subtitle: (t as any).job_role || t.job?.role || "Job Posting",
        avatar: (t as any).company_logo || null,
        lastMessage:
          (typeof t.last_message === "string"
            ? t.last_message
            : (t.last_message as any)?.content)?.trim() || "No messages yet",
        appliedAt:
          (typeof t.last_message === "object" && t.last_message
            ? t.last_message.createdAt
            : t.applied_at) || "",
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
        c.lastMessage.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  const selectedConvo = conversations.find(
    (c) => c.id === resolvedSelectedId,
  );

  const selectedThreadDetail = useMemo(
    () => threads.find((t) => t.application_id === resolvedSelectedId),
    [threads, resolvedSelectedId],
  );

  const messages: Message[] = useMemo(() => {
    if (!threadData) return [];
    return threadData.messages.map((msg) => ({
      id: msg._id,
      sender: msg.sender === "applicant" ? "me" : "them",
      text: msg.content,
      attachmentUrl: msg.attachment_url,
      attachmentName: msg.attachment_name,
      timestamp: msg.createdAt,
    }));
  }, [threadData]);

  // ─── Send / attach ────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!resolvedSelectedId || isSending || isUploadingAttachment) return;
    const trimmed = messageInput.trim();
    if (!trimmed && !selectedFile) return;
    setSendError("");

    try {
      if (selectedFile) {
        setIsUploadingAttachment(true);
        await sendJobSeekerAttachmentMessage(
          resolvedSelectedId,
          selectedFile,
          trimmed || undefined,
        );
      } else {
        setIsSending(true);
        await sendJobSeekerMessage(resolvedSelectedId, trimmed);
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

  // ─── Auto-scroll on new messages or thread switch ────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [resolvedSelectedId, messages.length]);

  return (
    <RoleGuard allowedRoles={["job_seeker"]}>
      <div className="h-[calc(100vh-73px)] flex flex-col bg-gray-50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col px-4 md:px-6 py-4 md:py-6">
          {/* Header */}
          <div className="mb-4 md:mb-6 shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Messages
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Chat with employers about your applications
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
              {selectedConvo && selectedThreadDetail ? (
                <>
                  <ChatHeader
                    name={selectedConvo.name}
                    subtitle={selectedConvo.subtitle}
                    email={(selectedThreadDetail as any).employer_email || selectedThreadDetail.employer?.email}
                    phone={(selectedThreadDetail as any).employer_phone || selectedThreadDetail.employer?.phone}
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
                    userName={userProfile?.full_name ?? "You"}
                    userAvatar={userProfile?.picture}
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
                    When an employer messages you about an application,
                    it&apos;ll show up here.
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
