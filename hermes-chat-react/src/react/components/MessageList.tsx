import React, { useEffect, useRef } from "react";
import type { Message as MessageType, HermesUser } from "../../types/index";
import { Message as DefaultMessage } from "./Message/Message";
import { DateSeparator as DefaultDateSeparator } from "./DateSeparator/DateSeparator";
import { EmptyStateIndicator as DefaultEmptyState } from "./EmptyStateIndicator/EmptyStateIndicator";
import { LoadingIndicator as DefaultLoading } from "./Loading/LoadingIndicator";
import { TypingIndicator as DefaultTypingIndicator } from "./TypingIndicator";
import { useRoomStateContext } from "../context/RoomStateContext";
import { useRoomActionContext } from "../context/RoomActionContext";
import { useChatContext } from "../context/ChatContext";
import { useTypingContext } from "../context/TypingContext";
import { useComponentContext } from "../context/ComponentContext";

export interface MessageListProps {
  /** Messages array (optional if inside <Room>) */
  messages?: MessageType[];
  /** Current user (optional if inside <Chat>) */
  currentUser?: HermesUser;
  /** Loading state */
  loading?: boolean;
  /** Loading more state */
  loadingMore?: boolean;
  /** Has more messages */
  hasMore?: boolean;
  /** Load more callback */
  onLoadMore?: () => void;
  /** Edit callback */
  onEdit?: (messageId: string, text: string) => void;
  /** Delete callback */
  onDelete?: (messageId: string) => void;
  /** Reaction callback */
  onReact?: (messageId: string, emoji: string) => void;
  /** Reply (quote) callback */
  onReply?: (message: MessageType) => void;
  /** Thread open callback */
  onOpenThread?: (message: MessageType) => void;
  /** Custom message renderer (full override) */
  renderMessage?: (message: MessageType, isOwn: boolean) => React.ReactNode;
  /** Custom avatar renderer */
  renderAvatar?: (senderId: string) => React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Auto-scroll to bottom on new messages */
  autoScroll?: boolean;
  /** Typing users (optional if inside <Room>) */
  typingUsers?: { userId: string; displayName: string }[];
  /** Whether to show date separators between days */
  disableDateSeparator?: boolean;
  /** Typing indicator text (optional if inside <Room>) */
  typingText?: string | null;
}

const isSameDay = (d1: string, d2: string) => {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

/**
 * Displays a scrollable list of messages with date separators,
 * typing indicators, and infinite scroll.
 *
 * **Context-aware:** When used inside `<Room>`, reads messages, loading state,
 * and typing state automatically. When used standalone, accepts all data via props.
 *
 * @example
 * ```tsx
 * // Context-aware (recommended)
 * <Room roomId={id}>
 *   <Window>
 *     <MessageList />
 *     <ChatInput />
 *   </Window>
 * </Room>
 *
 * // Standalone (prop-driven)
 * <MessageList
 *   messages={messages}
 *   currentUser={user}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export const MessageList: React.FC<MessageListProps> = (props) => {
  // Try to get context values — these will be empty objects if not in a provider
  const chatCtx = useChatContext("MessageList");
  const roomStateCtx = useRoomStateContext("MessageList");
  const roomActionCtx = useRoomActionContext("MessageList");
  const typingCtx = useTypingContext("MessageList");
  const componentCtx = useComponentContext("MessageList");

  // Merge: props override context
  const messages = props.messages ?? roomStateCtx.messages ?? [];
  const currentUser = props.currentUser ?? (chatCtx.currentUser as HermesUser);
  const loading = props.loading ?? roomStateCtx.loading ?? false;
  const loadingMore = props.loadingMore ?? roomStateCtx.loadingMore ?? false;
  const hasMore = props.hasMore ?? roomStateCtx.hasMore ?? false;
  const onLoadMore = props.onLoadMore ?? roomActionCtx.loadMore;
  const onEdit = props.onEdit ?? (roomActionCtx.editMessage ? (id: string, text: string) => roomActionCtx.editMessage(id, text) : undefined);
  const onDelete = props.onDelete ?? (roomActionCtx.deleteMessage ? (id: string) => roomActionCtx.deleteMessage(id) : undefined);
  const onReact = props.onReact ?? (roomActionCtx.addReaction ? (id: string, emoji: string) => roomActionCtx.addReaction(id, emoji) : undefined);
  const onReply = props.onReply;
  const onOpenThread = props.onOpenThread ?? (roomActionCtx.openThread ? (msg: MessageType) => roomActionCtx.openThread(msg) : undefined);
  const autoScroll = props.autoScroll ?? true;
  const disableDateSeparator = props.disableDateSeparator ?? false;
  const className = props.className ?? "";
  const renderMessage = props.renderMessage;
  const renderAvatar = props.renderAvatar;

  // Typing
  const typingText = props.typingText ?? typingCtx.typingText ?? null;

  // Component overrides
  const MessageComponent = componentCtx.Message || DefaultMessage;
  const DateSepComponent = componentCtx.DateSeparator || DefaultDateSeparator;
  const EmptyComponent = componentCtx.EmptyStateIndicator || DefaultEmptyState;
  const LoadingComponent = componentCtx.LoadingIndicator || DefaultLoading;
  const TypingComponent = componentCtx.TypingIndicator || DefaultTypingIndicator;

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // Infinite scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onLoadMore) return;
    const onScroll = () => {
      if (container.scrollTop === 0 && hasMore && !loadingMore) onLoadMore();
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [hasMore, loadingMore, onLoadMore]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          flex: 1,
        }}
      >
        <LoadingComponent text="Loading messages..." />
      </div>
    );
  }

  // Compute group styles
  const getGroupStyle = (index: number): "top" | "middle" | "bottom" | "single" => {
    const msg = messages[index];
    const prev = index > 0 ? messages[index - 1] : null;
    const next = index < messages.length - 1 ? messages[index + 1] : null;
    const sameSenderPrev = prev && prev.senderId === msg.senderId && !prev.isDeleted && isSameDay(prev.createdAt, msg.createdAt);
    const sameSenderNext = next && next.senderId === msg.senderId && !next.isDeleted && isSameDay(next.createdAt, msg.createdAt);
    if (sameSenderPrev && sameSenderNext) return "middle";
    if (sameSenderPrev) return "bottom";
    if (sameSenderNext) return "top";
    return "single";
  };

  return (
    <>
      <style>{`
        @keyframes hermes-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
        @keyframes hermes-pop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`hermes-message-list ${className}`}
        style={{
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "16px",
        }}
      >
        {/* Load more */}
        {hasMore && (
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            {loadingMore ? (
              <LoadingComponent size={20} text="Loading older messages..." />
            ) : (
              <button
                onClick={onLoadMore}
                style={{
                  background: "none",
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Load older messages
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && <EmptyComponent listType="message" />}

        {/* Messages */}
        {messages.map((message, index) => {
          const isOwn = message.senderId === currentUser?.userId;
          const groupStyle = getGroupStyle(index);

          // Date separator
          const showDateSep =
            !disableDateSeparator &&
            (index === 0 ||
              !isSameDay(messages[index - 1].createdAt, message.createdAt));

          return (
            <React.Fragment key={message._id}>
              {showDateSep && (
                <DateSepComponent date={new Date(message.createdAt)} />
              )}
              <div style={{ marginBottom: groupStyle === "bottom" || groupStyle === "single" ? 8 : 2 }}>
                {renderMessage ? (
                  renderMessage(message, isOwn)
                ) : (
                  <MessageComponent
                    message={message}
                    isOwn={isOwn}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReact={onReact}
                    onReply={onReply}
                    onOpenThread={onOpenThread}
                    renderAvatar={renderAvatar}
                    groupStyle={groupStyle}
                    showAvatar
                  />
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* Typing indicator */}
        {typingText && <TypingComponent typingText={typingText} />}

        <div ref={bottomRef} />
      </div>
    </>
  );
};
