import React from "react";
import { useRoomStateContext } from "../../context/RoomStateContext";
import { useRoomActionContext } from "../../context/RoomActionContext";
import { useChatContext } from "../../context/ChatContext";
import { useComponentContext } from "../../context/ComponentContext";
import { ThreadHeader as DefaultThreadHeader } from "./ThreadHeader";
import { Message as DefaultMessage } from "../Message/Message";
import { EmptyStateIndicator } from "../EmptyStateIndicator/EmptyStateIndicator";
import type { Message as MessageType } from "../../../types/index";

export interface ThreadProps {
  /** Additional class name */
  className?: string;
  /** Whether to auto-focus the composer when thread opens */
  autoFocus?: boolean;
}

/**
 * Thread component renders a parent message with a list of replies
 * and a composer for new replies. It reads state from `RoomStateContext`
 * and actions from `RoomActionContext`.
 *
 * @example
 * ```tsx
 * <Room roomId={id}>
 *   <Window>
 *     <MessageList />
 *     <ChatInput />
 *   </Window>
 *   <Thread />
 * </Room>
 * ```
 */
export const Thread: React.FC<ThreadProps> = ({
  className = "",
  autoFocus = true,
}) => {
  const { currentUser, customClasses } = useChatContext("Thread");
  const { thread, threadMessages, threadHasMore, threadLoadingMore } =
    useRoomStateContext("Thread");
  const { closeThread, addReaction, deleteMessage, editMessage } =
    useRoomActionContext("Thread");
  const {
    ThreadHeader: CustomThreadHeader,
    Message: CustomMessage,
  } = useComponentContext("Thread");

  if (!thread) return null;

  const ThreadHeaderComponent = CustomThreadHeader || DefaultThreadHeader;
  const MessageComponent = CustomMessage || DefaultMessage;

  const threadClass =
    customClasses?.thread || `hermes-thread ${className}`.trim();

  return (
    <div
      className={threadClass}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderLeft: "1px solid rgba(128,128,128,0.15)",
        minWidth: 320,
        maxWidth: 420,
      }}
    >
      <ThreadHeaderComponent thread={thread} onClose={closeThread} />

      {/* Parent message */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(128,128,128,0.1)",
          background: "rgba(128,128,128,0.03)",
        }}
      >
        <MessageComponent
          message={thread}
          isOwn={thread.senderId === currentUser?.userId}
          onReact={(id: string, emoji: string) => addReaction(id, emoji)}
          showAvatar
        />
      </div>

      {/* Replies */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {threadMessages.length === 0 ? (
          <EmptyStateIndicator listType="thread" />
        ) : (
          threadMessages.map((msg) => (
            <div key={msg._id} style={{ marginBottom: 8 }}>
              <MessageComponent
                message={msg}
                isOwn={msg.senderId === currentUser?.userId}
                onEdit={(id: string, text: string) => editMessage(id, text)}
                onDelete={(id: string) => deleteMessage(id)}
                onReact={(id: string, emoji: string) => addReaction(id, emoji)}
                showAvatar
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
