"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useThreadSocket } from "@/hooks/useThreadSocket";
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
  const paneRef = useRef<HTMLDivElement>(null);

  const resolvedSelectedId =
    selectedId || (threads.length > 0 ? threads[0].application_id : "");

  const {
    data: threadData,
    isLoading: threadLoading,
    mutate: mutateThread,
  } = useSWR(resolvedSelectedId ? ["thread", resolvedSelectedId] : null, () =>
    getThreadMessages(resolvedSelectedId),
  );

  // Live updates: the open conversation refreshes when the other side sends
  // or reads, via the Socket.IO room the backend already maintains.
  useThreadSocket(resolvedSelectedId || undefined, () => {
    void mutateThread();
    void mutateThreads();
  });

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

  /**
   * Fit the inbox to the window by measuring the chrome above it.
   *
   * This pane used to be `h-[calc(100vh-73px)]`. 73px is the height of the
   * mobile drawer's own header, not of anything on this page: the chrome here
   * is the sticky dashboard navbar plus the breadcrumb bar plus <main>'s top
   * padding, which is nearer 89px at 100%. All three are sized in rem, so the
   * accessibility text-size setting grows them — the navbar alone reaches
   * ~111px at 125% — while a hard-coded 73 stays where it is. The pane was
   * therefore always too tall, and got a little taller at every notch of the
   * setting, pushing the message input below the fold for exactly the readers
   * who had asked for bigger text.
   *
   * The measurement is written straight to the node rather than kept in
   * state: nothing else renders from it, and setState here would buy a second
   * render pass on every resize and every observer callback.
   */
  useLayoutEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const fit = () => {
      // Offset within the document, not within the viewport. A bare
      // getBoundingClientRect().top shrinks as the page scrolls, and feeding
      // that back into the height would take a slice off the pane every time
      // someone scrolled.
      const top = pane.getBoundingClientRect().top + window.scrollY;
      // The layout leaves a gutter below the page content. Ignoring it makes
      // the document one gutter taller than the window, which is a page
      // scrollbar on a pane whose whole purpose is not to need one.
      const parent = pane.parentElement;
      const gutter = parent
        ? parseFloat(getComputedStyle(parent).paddingBottom) || 0
        : 0;
      const available = window.innerHeight - top - gutter;
      // A window shorter than its own chrome would ask for a negative height.
      // Hand the pane back to content height and let the page scroll instead,
      // which is legible where a collapsed pane is not.
      pane.style.height = available > 0 ? `${available}px` : "";
    };

    fit();

    // The navbar is what moves this pane's top edge, and it moves for reasons
    // a resize listener never hears: the text-size setting changing, a font
    // finishing loading, nav items wrapping onto a second line. The observer
    // fires after layout, so re-reading the pane's offset then also picks up
    // the breadcrumbs and the padding growing in the same breath.
    //
    // `nav.sticky` is the dashboard navbar, and CreateJobPosting pins its own
    // sticky offsets off the same selector — if that class is ever renamed,
    // both go quiet rather than break, so grep for it before renaming.
    const navbar = document.querySelector("nav.sticky");
    const observer = new ResizeObserver(fit);
    if (navbar) observer.observe(navbar);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <div ref={paneRef} className="flex flex-col bg-gray-50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto w-full h-full flex flex-col px-4 md:px-6 py-4 md:py-6">
        <div className="mb-4 md:mb-6 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Inbox
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Conversations about jobs you applied to and jobs you posted
          </p>
        </div>

        {/* No standalone "Loading conversations…" banner. The list renders
            its own skeleton rows, so one component speaks for one fetch —
            this banner used to contradict the list's empty state, because
            the list was never passed isLoading. */}
        {threadsError && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-sm text-red-600 mb-4 shrink-0">
            Unable to load messages. Please refresh and try again.
          </div>
        )}

        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex min-h-0">
          <ConversationList
            conversations={filteredConversations}
            isLoading={threadsLoading}
            hiddenOnMobile={!!selectedId}
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

          {/* Mobile is one pane at a time: the list until a thread is
              explicitly opened, then the conversation with a back button.
              Both panes used to render side by side, which computed the chat
              to 0px width on phones. */}
          <div
            className={`${
              selectedId ? "flex" : "hidden md:flex"
            } flex-1 flex-col min-w-0 bg-gray-50/30 h-full`}
          >
            {selectedConvo && selectedThread ? (
              <>
                <ChatHeader
                  name={selectedConvo.name}
                  subtitle={selectedConvo.subtitle}
                  onBack={() => setSelectedId("")}
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
                    <p className="text-sm text-gray-500">Loading messages…</p>
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
                <p className="text-gray-600 max-w-xs">
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
