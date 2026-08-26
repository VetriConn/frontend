"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  HiOutlineXMark,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import {
  type AdminTicket,
  type TicketStatus,
  type TicketPriority,
  TICKET_TYPE_LABEL,
  TICKET_STATUS_LABEL,
  TICKET_PRIORITY_LABEL,
  replyToAdminTicket,
  resolveAdminTicket,
  closeAdminTicket,
} from "@/hooks/useAdminSupport";
import { useToaster } from "@/components/ui/Toaster";

// ─── Pill styles (match the rest of the admin shell) ────────────────────────

const STATUS_TONE: Record<TicketStatus, string> = {
  open: "bg-amber-50 text-amber-700 ring-amber-200/70",
  in_progress: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  closed: "bg-gray-100 text-gray-600 ring-gray-200/70",
};

const PRIORITY_TONE: Record<TicketPriority, string> = {
  low: "bg-gray-100 text-gray-700 ring-gray-200/70",
  medium: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  high: "bg-rose-50 text-rose-700 ring-rose-200/70",
  critical: "bg-rose-600 text-white ring-rose-700/30",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
};

// ─── Component ───────────────────────────────────────────────────────────────

interface TicketDetailDialogProps {
  ticket: AdminTicket | null;
  onClose: () => void;
  onTicketChange: (next: AdminTicket) => void;
}

const TicketDetailDialog = ({
  ticket,
  onClose,
  onTicketChange,
}: TicketDetailDialogProps) => {
  const { showToast } = useToaster();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<null | "reply" | "resolve" | "close">(null);
  const responsesRef = useRef<HTMLDivElement>(null);

  // Reset state per ticket
  useEffect(() => {
    setReply("");
  }, [ticket?.id]);

  // Close on Escape
  useEffect(() => {
    if (!ticket) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && busy === null) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ticket, busy, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!ticket) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [ticket]);

  if (!ticket) return null;

  const isClosed = ticket.status === "closed";

  const handleSendReply = async () => {
    const message = reply.trim();
    if (!message || isClosed) return;
    setBusy("reply");
    try {
      const newResponse = await replyToAdminTicket(ticket.id, message);
      const next: AdminTicket = {
        ...ticket,
        status: ticket.status === "open" ? "in_progress" : ticket.status,
        updatedAt: newResponse.createdAt,
        responses: [...ticket.responses, newResponse],
      };
      onTicketChange(next);
      setReply("");
      // Scroll to the latest message
      setTimeout(() => {
        responsesRef.current?.scrollTo({
          top: responsesRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
      showToast({ type: "success", title: "Reply sent" });
    } catch {
      showToast({ type: "error", title: "Could not send reply" });
    } finally {
      setBusy(null);
    }
  };

  const handleResolve = async () => {
    if (ticket.status === "resolved" || isClosed) return;
    setBusy("resolve");
    try {
      await resolveAdminTicket(ticket.id);
      onTicketChange({ ...ticket, status: "resolved" });
      showToast({ type: "success", title: "Marked as resolved" });
    } catch {
      showToast({ type: "error", title: "Could not update ticket" });
    } finally {
      setBusy(null);
    }
  };

  const handleClose = async () => {
    if (isClosed) return;
    setBusy("close");
    try {
      await closeAdminTicket(ticket.id);
      onTicketChange({ ...ticket, status: "closed" });
      showToast({ type: "success", title: "Ticket closed" });
    } catch {
      showToast({ type: "error", title: "Could not close ticket" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => busy === null && onClose()}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 md:px-6 py-4 border-b border-gray-100 flex items-start gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold text-gray-500 tracking-wider tabular-nums">
                {ticket.reference}
              </span>
              <span
                className={clsx(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1",
                  STATUS_TONE[ticket.status],
                )}
              >
                {TICKET_STATUS_LABEL[ticket.status]}
              </span>
              <span
                className={clsx(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1",
                  PRIORITY_TONE[ticket.priority],
                )}
              >
                {TICKET_PRIORITY_LABEL[ticket.priority]}
              </span>
            </div>
            <h2
              id="ticket-dialog-title"
              className="text-lg md:text-xl font-bold text-gray-900 tracking-tight"
            >
              {ticket.subject}
            </h2>
          </div>
          <button
            onClick={() => busy === null && onClose()}
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
            disabled={busy !== null}
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <MetaRow label="Submitted by" value={ticket.submitter.name} />
            <MetaRow label="Email" value={ticket.submitter.email} />
            <MetaRow label="Type" value={TICKET_TYPE_LABEL[ticket.type]} />
            <MetaRow label="Date" value={formatDate(ticket.createdAt)} />
          </div>

          {/* Description */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900">Description</h3>
            <div className="mt-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {ticket.description}
            </div>
          </section>

          {/* Responses */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900">Responses</h3>
            <div ref={responsesRef} className="mt-1.5 space-y-2.5">
              {ticket.responses.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  No responses yet.
                </p>
              ) : (
                ticket.responses.map((r) => (
                  <div
                    key={r.id}
                    className={clsx(
                      "rounded-xl px-3.5 py-3 border",
                      r.author === "admin"
                        ? "bg-rose-50/40 border-rose-100"
                        : "bg-gray-50 border-gray-100",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span
                        className={clsx(
                          "text-xs font-semibold",
                          r.author === "admin"
                            ? "text-primary"
                            : "text-gray-700",
                        )}
                      >
                        {r.authorName}
                      </span>
                      <span className="text-[11px] text-gray-500 tabular-nums">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {r.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Reply */}
          {!isClosed && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900">Reply</h3>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                placeholder="Type your response…"
                className="mt-1.5 w-full px-3.5 py-2.5 text-sm border border-rose-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
              />
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 md:px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleResolve}
              disabled={
                busy !== null ||
                ticket.status === "resolved" ||
                ticket.status === "closed"
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
              {busy === "resolve" ? "Saving…" : "Mark Resolved"}
            </button>
            <button
              onClick={handleClose}
              disabled={busy !== null || isClosed}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {busy === "close" ? "Closing…" : "Close Ticket"}
            </button>
          </div>
          <button
            onClick={handleSendReply}
            disabled={busy !== null || reply.trim().length === 0 || isClosed}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors shadow-[0_8px_20px_-12px_rgba(229,62,62,0.7)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
            {busy === "reply" ? "Sending…" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline gap-2">
    <span className="text-xs font-semibold text-gray-500 shrink-0">
      {label}:
    </span>
    <span className="text-sm text-gray-900 truncate">{value}</span>
  </div>
);

export default TicketDetailDialog;
