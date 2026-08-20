"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  getMessageThreads,
  getThreadMessages,
  sendThreadMessage,
  sendThreadAttachment,
  type ThreadSummary,
} from "@/lib/api/messages";
import { ConversationList } from "@/components/dashboard/inbox/ConversationList";
import { ChatHeader } from "@/components/dashboard/inbox/ChatHeader";
import { MessageList } from "@/components/dashboard/inbox/MessageList";
import { ChatInput } from "@/components/dashboard/inbox/ChatInput";
import type { Conversation, Message } from "@/types/inbox";

/**
 * One inbox holding both sides of the account's conversations: threads where
 * they applied and threads where they are hiring. Each row says which it is,
 * because the same person can be doing both with the same company.
 */

/** Who the thread is with, from this account's point of view. */
const counterpartName = (thread: ThreadSummary): string =>
  thread.side === "employer"
    ? thread.counterpart.full_name || "Applicant"
    : thread.job.company_name || thread.counterpart.full_name || "Hiring team";

export default function Inbox() {
  const { userProfile } = useUserProfile();

  const {
    data: threads = [],
    isLoading: threadsLoading,
    error: threadsError,
    mutate: mutateThreads,
  } = useSWR("message-threads", getMessageThreads);

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

  const {
    data: threadData,
    isLoading: threadLoading,
    mutate: mutateThread,
  } = useSWR(resolvedSelectedId ? ["thread", resolvedSelectedId] : null, () =>
    getThreadMessages(resolvedSelectedId),
  );

  const selectedThread = useMemo(
    () => threads.find((t) => t.application_id === resolvedSelectedId),
    [threads, resolvedSelectedId],
  );

  const conversations: Conversation[] = useMemo(
    () =>
      threads.map((thread) => ({
        id: thread.application_id,
        name: counterpartName(thread),
        // The role is the thread's subject either way; the tag says which side
        // of it this account is on.
        subtitle:
          thread.side === "employer"
            ? `${thread.job.role || "Your posting"} · hiring`
            : `${thread.job.role || "Job posting"} · you applied`,
        avatar: thread.side === "applicant" ? thread.job.company_logo : null,
        lastMessage: thread.last_message?.trim() || "No messages yet",
        appliedAt: thread.last_message_at || thread.applied_at || "",
        unreadCount: thread.unread_count,
        jobRole: thread.job.role,
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

  const selectedConvo = conversations.find((c) => c.id === resolvedSelectedId);

  const messages: Message[] = useMemo(() => {
    if (!threadData || !selectedThread) return [];
    // "me" is whichever side this account is on for THIS thread — it differs
    // per row, which is exactly why one list can hold both.
    return threadData.messages.map((msg) => ({
      id: msg._id,
      sender: msg.sender === selectedThread.side ? "me" : "them",
      text: msg.content,
      attachmentUrl: msg.attachment_url,
      attachmentName: msg.attachment_name,
      timestamp: msg.createdAt,
    }));
  }, [threadData, selectedThread]);

  const handleSend = async () => {
    if (!resolvedSelectedId || isSending || isUploadingAttachment) return;
    const trimmed = messageInput.trim();
    if (!trimmed && !selectedFile) return;
    setSendError("");

    try {
      if (selectedFile) {
        setIsUploadingAttachment(true);
        await sendThreadAttachment(
          resolvedSelectedId,
          selectedFile,
          trimmed || undefined,
        );
      } else {
        setIsSending(true);
        await sendThreadMessage(resolvedSelectedId, trimmed);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [resolvedSelectedId, messages.length]);

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col bg-gray-50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col px-4 md:px-6 py-4 md:py-6">
        <div className="mb-4 md:mb-6 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Conversations about jobs you applied to and jobs you posted
          </p>
        </div>

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
            {selectedConvo && selectedThread ? (
              <>
                <ChatHeader
                  name={selectedConvo.name}
                  subtitle={selectedConvo.subtitle}
                  // Contact details only exist on the hiring side, where they
                  // came from the application the person submitted.
                  email={
                    selectedThread.side === "employer"
                      ? selectedThread.counterpart.email
                      : undefined
                  }
                  phone={
                    selectedThread.side === "employer"
                      ? selectedThread.counterpart.phone
                      : undefined
                  }
                />

                {threadLoading && messages.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-gray-400">Loading messages…</p>
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
                  onAttachmentChange={(file: File) => {
                    setSendError("");
                    setSelectedFile(file);
                  }}
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
                  Messages about your applications and about people applying to
                  your jobs will show up here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
