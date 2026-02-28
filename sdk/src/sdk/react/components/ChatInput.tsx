import React, { useState, useRef, useCallback } from "react";
import type { Message, UploadResult } from "../../types/index";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSendText: (text: string) => Promise<void> | void;
  onSendFile?: (file: File) => Promise<void> | void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  inputClassName?: string;
  renderAttachIcon?: () => React.ReactNode;
  renderSendIcon?: () => React.ReactNode;
}

// ── ChatInput ─────────────────────────────────────────────────────────────────

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendText,
  onSendFile,
  onTypingStart,
  onTypingStop,
  replyingTo,
  onCancelReply,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 4000,
  className = "",
  inputClassName = "",
  renderAttachIcon,
  renderSendIcon,
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    resizeTextarea();
    onTypingStart?.();
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    try {
      await onSendText(trimmed);
      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onTypingStop?.();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onSendFile) return;
    await onSendFile(file);
    // Reset file input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div
      className={`hermes-chat-input ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "8px 12px",
        borderTop: "1px solid #e0e0e0",
      }}
    >
      {/* Reply preview */}
      {replyingTo && (
        <div
          className="hermes-chat-input__reply"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 10px",
            marginBottom: 6,
            background: "#f5f5f5",
            borderRadius: 8,
            borderLeft: "3px solid #0084ff",
            fontSize: 12,
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <span style={{ fontWeight: 600, marginRight: 4 }}>
              Replying to:
            </span>
            <span style={{ opacity: 0.7 }}>
              {replyingTo.type === "text"
                ? replyingTo.text?.slice(0, 60)
                : `[${replyingTo.type}]`}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input row */}
      <div
        className="hermes-chat-input__row"
        style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
      >
        {/* File attach */}
        {onSendFile && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
              className="hermes-chat-input__attach"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                flexShrink: 0,
                opacity: disabled ? 0.4 : 1,
              }}
            >
              {renderAttachIcon ? (
                renderAttachIcon()
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
          </>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => onTypingStop?.()}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className={`hermes-chat-input__textarea ${inputClassName}`}
          style={{
            flex: 1,
            resize: "none",
            border: "1px solid #e0e0e0",
            borderRadius: 20,
            padding: "8px 14px",
            fontSize: 14,
            lineHeight: 1.5,
            outline: "none",
            overflow: "hidden",
            background: disabled ? "#f5f5f5" : "#fff",
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className="hermes-chat-input__send"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            flexShrink: 0,
            opacity: !text.trim() || sending || disabled ? 0.4 : 1,
          }}
        >
          {renderSendIcon ? (
            renderSendIcon()
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Character count */}
      {text.length > maxLength * 0.8 && (
        <div
          style={{
            fontSize: 10,
            textAlign: "right",
            opacity: 0.5,
            marginTop: 2,
          }}
        >
          {text.length}/{maxLength}
        </div>
      )}
    </div>
  );
};
