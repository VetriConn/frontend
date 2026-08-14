import React, { useRef } from "react";
import {
  HiOutlinePaperAirplane,
  HiOutlinePaperClip,
  HiOutlineXMark,
  HiOutlineDocumentText,
} from "react-icons/hi2";

interface ChatInputProps {
  messageInput: string;
  setMessageInput: (val: string) => void;
  onSend: () => void;
  onAttachmentChange: (file: File) => void;
  isSending?: boolean;
  isUploadingAttachment?: boolean;
  sendError?: string;
  selectedFile?: File | null;
  onClearFile?: () => void;
}

export function ChatInput({
  messageInput,
  setMessageInput,
  onSend,
  onAttachmentChange,
  isSending,
  isUploadingAttachment,
  sendError,
  selectedFile,
  onClearFile,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAttachmentChange(file);
    }
    e.target.value = "";
  };

  return (
    <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-white shrink-0">
      {sendError && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{sendError}</p>
        </div>
      )}

      {selectedFile && (
        <div className="mb-3 flex items-center justify-between gap-3 p-2 bg-gray-50 border border-gray-200 rounded-lg animate-in slide-in-from-bottom-1 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <HiOutlineDocumentText className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-medium text-gray-700 truncate">
              {selectedFile.name}
            </span>
          </div>
          {onClearFile && (
            <button
              onClick={onClearFile}
              className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors shrink-0"
          aria-label="Attach file"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAttachment || isSending}
        >
          <HiOutlinePaperClip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex-1 relative">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
        </div>
        <button
          className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          aria-label="Send message"
          onClick={onSend}
          disabled={
            isSending ||
            isUploadingAttachment ||
            (!messageInput.trim() && !selectedFile)
          }
        >
          <HiOutlinePaperAirplane className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}
