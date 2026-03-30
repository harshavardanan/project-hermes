
export * from "./index";

// ─── Context Providers & Hooks ───
export * from "./react/context";

// ─── Hooks ───
export { useMessages } from "./react/hooks/useMessages";
export { useRooms } from "./react/hooks/useRooms";
export { usePresence } from "./react/hooks/usePresence";
export { useTyping } from "./react/hooks/useTyping";
export { useReadReceipts } from "./react/hooks/useReadReceipts";
export { useReactions } from "./react/hooks/useReactions";
export { useUpload } from "./react/hooks/useUpload";

// ─── Wrapper Components ───
export { Chat } from "./react/components/Chat";
export type { ChatProps } from "./react/components/Chat";
export { Room } from "./react/components/Room";
export type { RoomProps } from "./react/components/Room";
export { Window } from "./react/components/Window";
export type { WindowProps } from "./react/components/Window";

// ─── Core UI Components (original names preserved) ───
export { MessageList } from "./react/components/MessageList";
export { ChatInput } from "./react/components/ChatInput";
export { RoomList } from "./react/components/RoomList";
export { TypingIndicator } from "./react/components/TypingIndicator";
export { OnlineBadge } from "./react/components/OnlineBadge";
export { ReactionPicker } from "./react/components/ReactionPicker";
export { MediaMessage } from "./react/components/MediaMessage";

// ─── New Feature Components ───
export { Message, MessageStatus, MessageActions } from "./react/components/Message";
export type { MessageProps, MessageStatusProps, MessageActionsProps } from "./react/components/Message";
export { Thread, ThreadHeader } from "./react/components/Thread";
export type { ThreadProps, ThreadHeaderProps } from "./react/components/Thread";
export { Avatar } from "./react/components/Avatar";
export type { AvatarProps } from "./react/components/Avatar";
export { DateSeparator } from "./react/components/DateSeparator";
export type { DateSeparatorProps } from "./react/components/DateSeparator";
export { LoadingIndicator, LoadingErrorIndicator } from "./react/components/Loading";
export type { LoadingIndicatorProps, LoadingErrorIndicatorProps } from "./react/components/Loading";
export { EmptyStateIndicator } from "./react/components/EmptyStateIndicator";
export type { EmptyStateIndicatorProps } from "./react/components/EmptyStateIndicator";
export { Modal } from "./react/components/Modal";
export type { ModalProps } from "./react/components/Modal";
export { Search } from "./react/components/Search";
export type { SearchProps } from "./react/components/Search";
