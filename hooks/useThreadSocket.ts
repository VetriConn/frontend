"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api/client";

/**
 * Live inbox: joins a thread's Socket.IO room and invokes the callback when a
 * message lands, so the open conversation updates without a manual refresh.
 *
 * The backend ran this server (rooms, membership checks, message_received
 * emits) with no client ever connecting (R3 #37) - the inbox refreshed only
 * on its own actions. One shared socket per tab, connected lazily on the
 * first thread open; auth rides the same httpOnly cookie as every API call
 * (withCredentials), which the server verifies in its handshake middleware.
 */

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE_URL, {
      withCredentials: true,
      // Start with websocket; fall back to polling where proxies interfere.
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function useThreadSocket(
  applicationId: string | undefined,
  onMessage: () => void,
): void {
  useEffect(() => {
    if (!applicationId) return;
    const s = getSocket();
    s.emit("join_thread", applicationId);

    const handleReceived = () => onMessage();
    const handleRead = () => onMessage();
    s.on("message_received", handleReceived);
    s.on("read_receipt", handleRead);

    return () => {
      s.emit("leave_thread", applicationId);
      s.off("message_received", handleReceived);
      s.off("read_receipt", handleRead);
    };
    // onMessage is intentionally not a dependency: callers pass inline
    // closures over mutate(), which is stable; re-subscribing per render
    // would thrash the room membership.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);
}
