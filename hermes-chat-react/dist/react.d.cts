import { HermesClient, HermesUser, Room as Room$1, Message as Message$1, SendMessageInput, DeliveryStatus, CreateDirectRoomInput, CreateGroupRoomInput, Reaction, UploadResult } from './index.cjs';
export { ConnectResponse, ConnectionStatus, HermesConfig, HermesEvents, LastSeenEvent, MessageHistoryResult, MessageType, PresenceEvent, ReactionEvent, ReceiptEvent, RoomType, TypingEvent } from './index.cjs';
import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { PropsWithChildren } from 'react';

type CustomClasses = Partial<Record<"chat" | "roomList" | "room" | "messageList" | "message" | "thread" | "window", string>>;
interface ChatContextValue {
    /** The HermesClient instance powering the SDK */
    client: HermesClient;
    /** The currently connected user */
    currentUser: HermesUser | null;
    /** Visual theme identifier */
    theme: string;
    /** The currently active room */
    activeRoom?: Room$1;
    /** Set the active room */
    setActiveRoom: (room?: Room$1) => void;
    /** Open mobile navigation */
    openMobileNav: () => void;
    /** Close mobile navigation */
    closeMobileNav: () => void;
    /** Whether mobile nav is open */
    navOpen: boolean;
    /** Custom CSS class overrides for main SDK containers */
    customClasses?: CustomClasses;
}
declare const ChatContext: React.Context<ChatContextValue | undefined>;
declare const ChatProvider: ({ children, value, }: PropsWithChildren<{
    value: ChatContextValue;
}>) => react_jsx_runtime.JSX.Element;
/**
 * Access the ChatContext. Must be used within a `<Chat>` component.
 */
declare const useChatContext: (componentName?: string) => ChatContextValue;

interface RoomStateContextValue {
    /** The Room object for this context */
    room: Room$1;
    /** Messages in the current room */
    messages: Message$1[];
    /** Whether messages are initially loading */
    loading: boolean;
    /** Whether older messages are being loaded */
    loadingMore: boolean;
    /** Whether there are more messages to load */
    hasMore: boolean;
    /** Error during message fetching */
    error: string | null;
    /** Members of the room */
    members: string[];
    /** The active thread parent message (null if no thread open) */
    thread: Message$1 | null;
    /** Messages within the active thread */
    threadMessages: Message$1[];
    /** Whether the thread has more messages to load */
    threadHasMore: boolean;
    /** Whether thread is loading more messages */
    threadLoadingMore: boolean;
    /** Pinned messages in the room */
    pinnedMessages: Message$1[];
}
declare const RoomStateContext: React.Context<RoomStateContextValue | undefined>;
declare const RoomStateProvider: ({ children, value, }: PropsWithChildren<{
    value: RoomStateContextValue;
}>) => react_jsx_runtime.JSX.Element;
/**
 * Access the RoomStateContext. Must be used within a `<Room>` component.
 */
declare const useRoomStateContext: (componentName?: string) => RoomStateContextValue;

interface RoomActionContextValue {
    /** Send a message to the current room */
    sendMessage: (input: Omit<SendMessageInput, "roomId">) => Promise<Message$1>;
    /** Edit a message */
    editMessage: (messageId: string, text: string) => Promise<Message$1>;
    /** Delete a message */
    deleteMessage: (messageId: string) => Promise<void>;
    /** Add a reaction to a message */
    addReaction: (messageId: string, emoji: string) => Promise<void>;
    /** Load older messages */
    loadMore: () => Promise<void>;
    /** Mark room as seen */
    markRead: (lastMessageId: string) => Promise<void>;
    /** Open a thread for a specific message */
    openThread: (message: Message$1) => void;
    /** Close the currently open thread */
    closeThread: () => void;
    /** Load more thread replies */
    loadMoreThread: () => Promise<void>;
}
declare const RoomActionContext: React.Context<RoomActionContextValue | undefined>;
declare const RoomActionProvider: ({ children, value, }: PropsWithChildren<{
    value: RoomActionContextValue;
}>) => react_jsx_runtime.JSX.Element;
/**
 * Access the RoomActionContext. Must be used within a `<Room>` component.
 */
declare const useRoomActionContext: (componentName?: string) => RoomActionContextValue;

type GroupStyle = "top" | "middle" | "bottom" | "single";
interface MessageContextValue {
    /** The message object */
    message: Message$1;
    /** Whether actions (edit, delete, flag, etc.) are enabled */
    actionsEnabled: boolean;
    /** Whether this message belongs to the current user */
    isMyMessage: boolean;
    /** Handle editing the message */
    handleEdit: (text: string) => Promise<void>;
    /** Handle deleting the message */
    handleDelete: () => Promise<void>;
    /** Handle adding a reaction */
    handleReaction: (emoji: string) => Promise<void>;
    /** Handle replying (inline quote) */
    handleReply: () => void;
    /** Handle opening a thread */
    handleOpenThread: () => void;
    /** Message delivery status */
    deliveryStatus: DeliveryStatus;
    /** Users who have seen this message */
    readBy: string[];
    /** Group style for visual grouping of consecutive messages from the same sender */
    groupStyle: GroupStyle;
    /** Whether this message is highlighted (e.g. jump-to-message) */
    highlighted?: boolean;
    /** Whether this message is in a thread list */
    threadList?: boolean;
    /** Custom date formatter */
    formatDate?: (date: Date) => string;
}
declare const MessageContext: React.Context<MessageContextValue | undefined>;
declare const MessageProvider: ({ children, value, }: PropsWithChildren<{
    value: MessageContextValue;
}>) => react_jsx_runtime.JSX.Element;
/**
 * Access the MessageContext. Must be used within a `<Message>` component.
 */
declare const useMessageContext: (componentName?: string) => MessageContextValue;

/**
 * ComponentContext allows developers to override any internal UI component
 * with their own implementation. This is the Inversion of Control (IoC) pattern
 * used by Stream Chat React.
 *
 * Usage:
 * ```tsx
 * <Room roomId={id} Avatar={MyCustomAvatar} Message={MyCustomMessage}>
 *   <MessageList />
 * </Room>
 * ```
 */
interface ComponentContextValue {
    /** Custom Avatar component */
    Avatar?: React.ComponentType<any>;
    /** Custom Message bubble component */
    Message?: React.ComponentType<any>;
    /** Custom MessageStatus component (delivery indicators) */
    MessageStatus?: React.ComponentType<any>;
    /** Custom MessageActions component (hover toolbar) */
    MessageActions?: React.ComponentType<any>;
    /** Custom DateSeparator component */
    DateSeparator?: React.ComponentType<any>;
    /** Custom EmptyStateIndicator component */
    EmptyStateIndicator?: React.ComponentType<any>;
    /** Custom LoadingIndicator component */
    LoadingIndicator?: React.ComponentType<any>;
    /** Custom LoadingErrorIndicator component */
    LoadingErrorIndicator?: React.ComponentType<any>;
    /** Custom ReactionPicker component */
    ReactionPicker?: React.ComponentType<any>;
    /** Custom TypingIndicator component */
    TypingIndicator?: React.ComponentType<any>;
    /** Custom MediaMessage (attachment renderer) component */
    MediaMessage?: React.ComponentType<any>;
    /** Custom ThreadHeader component */
    ThreadHeader?: React.ComponentType<any>;
    /** Custom Modal component */
    Modal?: React.ComponentType<any>;
    /** Custom ChatInput component */
    ChatInput?: React.ComponentType<any>;
    /** Custom RoomListItem component */
    RoomListItem?: React.ComponentType<any>;
    /** Custom Search component */
    Search?: React.ComponentType<any>;
    /** Custom OnlineBadge component */
    OnlineBadge?: React.ComponentType<any>;
}
declare const ComponentContext: React.Context<ComponentContextValue>;
declare const ComponentProvider: ({ children, value, }: PropsWithChildren<{
    value: Partial<ComponentContextValue>;
}>) => react_jsx_runtime.JSX.Element;
/**
 * Access component overrides. Returns an empty object if no overrides are set.
 */
declare const useComponentContext: (_componentName?: string) => ComponentContextValue;

interface TypingContextValue {
    /** Map of userId → displayName for users currently typing */
    typingUsers: Map<string, string>;
    /** Human-readable typing indicator text (e.g. "Alice is typing...") */
    typingText: string | null;
    /** Whether anyone is currently typing */
    isAnyoneTyping: boolean;
    /** Emit a typing start event */
    startTyping: () => void;
    /** Emit a typing stop event */
    stopTyping: () => void;
}
declare const TypingContext: React.Context<TypingContextValue | undefined>;
declare const TypingProvider: ({ children, value, }: PropsWithChildren<{
    value: TypingContextValue;
}>) => react_jsx_runtime.JSX.Element;
/**
 * Access typing state for the current room. Must be within a `<Room>` component.
 */
declare const useTypingContext: (componentName?: string) => TypingContextValue;

declare const useMessages: (client: HermesClient, roomId: string | null) => {
    messages: Message$1[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    typingUsers: {
        userId: string;
        displayName: string;
    }[];
    sendMessage: (input: Omit<SendMessageInput, "roomId">) => Promise<Message$1>;
    editMessage: (messageId: string, text: string) => Promise<Message$1>;
    deleteMessage: (messageId: string) => Promise<void>;
    addReaction: (messageId: string, emoji: string) => Promise<void>;
    loadMore: () => Promise<void>;
};

declare const useRooms: (client: HermesClient) => {
    rooms: Room$1[];
    loading: boolean;
    error: string | null;
    createDirect: (input: CreateDirectRoomInput) => Promise<Room$1>;
    createGroup: (input: CreateGroupRoomInput) => Promise<Room$1>;
    deleteRoom: (roomId: string) => Promise<void>;
    addMember: (roomId: string, userId: string) => Promise<void>;
    removeMember: (roomId: string, userId: string) => Promise<void>;
    refetch: () => Promise<void>;
};

declare const usePresence: (client: HermesClient) => {
    isOnline: (userId: string) => boolean;
    onlineUsers: string[];
    onlineMap: Map<string, boolean>;
};

declare const useTyping: (client: HermesClient, roomId: string | null) => {
    typingUsers: Map<string, string>;
    typingText: string | null;
    isAnyoneTyping: boolean;
    startTyping: () => void;
    stopTyping: () => void;
};

declare const useReadReceipts: (client: HermesClient, roomId: string | null) => {
    markSeen: (lastMessageId: string) => Promise<void>;
    seenBy: (messageId: string) => string[];
    receipts: Map<string, Set<string>>;
};

declare const useReactions: (client: HermesClient, roomId: string | null) => {
    react: (messageId: string, emoji: string) => Promise<void>;
    hasReacted: (reactions: Reaction[], emoji: string) => boolean;
    getCount: (reactions: Reaction[], emoji: string) => number;
    getEmojis: (reactions: Reaction[]) => string[];
};

declare const useUpload: (client: HermesClient) => {
    upload: (file: File) => Promise<UploadResult | null>;
    sendFile: (roomId: string, file: File, replyTo?: string) => Promise<Message$1 | null>;
    validate: (file: File, maxMb?: number) => string | null;
    uploading: boolean;
    error: string | null;
    lastUpload: UploadResult | null;
};

interface ChatProps {
    /** The HermesClient instance */
    client: HermesClient;
    /** Visual theme identifier, defaults to "light" */
    theme?: string;
    /** Custom CSS class overrides */
    customClasses?: CustomClasses;
    /** Initial mobile nav state */
    initialNavOpen?: boolean;
}
/**
 * Root wrapper component for the Hermes Chat SDK.
 *
 * Provides `ChatContext` to all child components. Place this at the top
 * of your chat UI tree.
 *
 * @example
 * ```tsx
 * const client = new HermesClient({ endpoint, apiKey, secret, userId, displayName });
 * await client.connect();
 *
 * <Chat client={client} theme="dark">
 *   <RoomList />
 *   <Room roomId={activeRoomId}>
 *     <Window>
 *       <MessageList />
 *       <ChatInput />
 *     </Window>
 *   </Room>
 * </Chat>
 * ```
 */
declare const Chat: ({ client, theme, customClasses, initialNavOpen, children, }: PropsWithChildren<ChatProps>) => react_jsx_runtime.JSX.Element;

interface RoomProps extends Partial<ComponentContextValue> {
    /** The room ID to load */
    roomId: string;
}
/**
 * Wraps a single room/channel, initialising all per-room state and making it
 * available to children via `RoomStateContext`, `RoomActionContext`, and
 * `TypingContext`.
 *
 * @example
 * ```tsx
 * <Room roomId="abc123">
 *   <Window>
 *     <MessageList />
 *     <ChatInput />
 *   </Window>
 *   <Thread />
 * </Room>
 * ```
 */
declare const Room: ({ roomId, children, Avatar, Message: MessageOverride, MessageStatus, MessageActions, DateSeparator, EmptyStateIndicator, LoadingIndicator, LoadingErrorIndicator, ReactionPicker, TypingIndicator, MediaMessage, ThreadHeader, Modal, ChatInput, RoomListItem, Search, OnlineBadge, }: PropsWithChildren<RoomProps>) => react_jsx_runtime.JSX.Element;

interface WindowProps {
    /** Additional class name */
    className?: string;
}
/**
 * Layout wrapper for the message area. Renders a flex-column container
 * that holds `<MessageList />` and `<ChatInput />`.
 *
 * @example
 * ```tsx
 * <Window>
 *   <MessageList />
 *   <ChatInput />
 * </Window>
 * ```
 */
declare const Window: ({ className, children, }: PropsWithChildren<WindowProps>) => react_jsx_runtime.JSX.Element;

interface MessageListProps {
    /** Messages array (optional if inside <Room>) */
    messages?: Message$1[];
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
    onReply?: (message: Message$1) => void;
    /** Thread open callback */
    onOpenThread?: (message: Message$1) => void;
    /** Custom message renderer (full override) */
    renderMessage?: (message: Message$1, isOwn: boolean) => React.ReactNode;
    /** Custom avatar renderer */
    renderAvatar?: (senderId: string) => React.ReactNode;
    /** Additional class name */
    className?: string;
    /** Auto-scroll to bottom on new messages */
    autoScroll?: boolean;
    /** Typing users (optional if inside <Room>) */
    typingUsers?: {
        userId: string;
        displayName: string;
    }[];
    /** Whether to show date separators between days */
    disableDateSeparator?: boolean;
    /** Typing indicator text (optional if inside <Room>) */
    typingText?: string | null;
}
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
declare const MessageList: React.FC<MessageListProps>;

interface ChatInputProps {
    /** Send text callback (optional if inside <Room>) */
    onSendText?: (text: string) => Promise<void> | void;
    /** Send file callback */
    onSendFile?: (file: File) => Promise<void> | void;
    /** Typing start callback (optional if inside <Room>) */
    onTypingStart?: () => void;
    /** Typing stop callback (optional if inside <Room>) */
    onTypingStop?: () => void;
    /** Message being replied to */
    replyingTo?: Message$1 | null;
    /** Cancel reply callback */
    onCancelReply?: () => void;
    /** Whether input is disabled */
    disabled?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Maximum character length */
    maxLength?: number;
    /** Additional class name */
    className?: string;
    /** Input element class name */
    inputClassName?: string;
    /** Custom attach icon renderer */
    renderAttachIcon?: () => React.ReactNode;
    /** Custom send icon renderer */
    renderSendIcon?: () => React.ReactNode;
}
/**
 * Message composer with text input, file upload, and reply preview.
 *
 * **Context-aware:** When used inside `<Room>`, automatically binds to
 * `sendMessage` and typing events. When used standalone, accepts all callbacks via props.
 *
 * @example
 * ```tsx
 * // Context-aware
 * <Room roomId={id}>
 *   <Window>
 *     <MessageList />
 *     <ChatInput />
 *   </Window>
 * </Room>
 *
 * // Standalone
 * <ChatInput onSendText={handleSend} onSendFile={handleFile} />
 * ```
 */
declare const ChatInput: React.FC<ChatInputProps>;

interface RoomListProps {
    rooms: Room$1[];
    activeRoomId?: string | null;
    currentUserId: string;
    loading?: boolean;
    onSelectRoom: (room: Room$1) => void;
    onCreateDirect?: () => void;
    onCreateGroup?: () => void;
    renderRoomItem?: (room: Room$1, isActive: boolean) => React.ReactNode;
    renderAvatar?: (room: Room$1) => React.ReactNode;
    renderEmpty?: () => React.ReactNode;
    className?: string;
    itemClassName?: string;
}
declare const RoomList: React.FC<RoomListProps>;

interface TypingIndicatorProps {
    typingText: string | null;
    className?: string;
}
declare const TypingIndicator: React.FC<TypingIndicatorProps>;

interface OnlineBadgeProps {
    isOnline: boolean;
    size?: number;
    className?: string;
}
declare const OnlineBadge: React.FC<OnlineBadgeProps>;

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    currentReactions?: Reaction[];
    currentUserId?: string;
    emojis?: string[];
    className?: string;
    align?: "left" | "right";
}
declare const ReactionPicker: React.FC<ReactionPickerProps>;

interface MediaMessageProps {
    message: Message$1;
    className?: string;
    maxWidth?: number | string;
}
declare const MediaMessage: React.FC<MediaMessageProps>;

interface MessageProps {
    message: Message$1;
    isOwn: boolean;
    /** Callbacks (optional — will fall back to context if available) */
    onEdit?: (messageId: string, text: string) => void;
    onDelete?: (messageId: string) => void;
    onReact?: (messageId: string, emoji: string) => void;
    onReply?: (message: Message$1) => void;
    onOpenThread?: (message: Message$1) => void;
    onPin?: (message: Message$1) => void;
    /** Avatar customization */
    renderAvatar?: (senderId: string) => React.ReactNode;
    /** Sender display name (for avatar fallback) */
    senderName?: string;
    /** Sender avatar URL */
    senderImage?: string;
    /** Group style for visual grouping */
    groupStyle?: "top" | "middle" | "bottom" | "single";
    /** Additional class name */
    className?: string;
    /** Whether to show the avatar */
    showAvatar?: boolean;
}
/**
 * A single message bubble with avatar, content, reactions, delivery status,
 * and action toolbar. This is the primary message rendering component.
 *
 * Can be used standalone or within a `<MessageList>`.
 */
declare const Message: React.FC<MessageProps>;

interface MessageStatusProps {
    /** The delivery status of the message */
    status: DeliveryStatus;
    /** Number of users who have seen the message */
    seenCount?: number;
    /** Whether this message was sent by the current user */
    isMyMessage?: boolean;
    /** Additional class name */
    className?: string;
}
/**
 * Renders delivery status indicators: ✓ (sent), ✓✓ (delivered), ✓✓ blue (seen).
 * Only shown for the current user's own messages.
 */
declare const MessageStatus: React.FC<MessageStatusProps>;

interface MessageActionsProps {
    /** Whether the current user owns the message */
    isOwn: boolean;
    /** Whether the message is a text message (enables edit) */
    isText: boolean;
    /** Whether the message has a thread */
    hasThread?: boolean;
    /** Reply count for threads */
    replyCount?: number;
    /** Callbacks */
    onReact?: () => void;
    onReply?: () => void;
    onThread?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onPin?: () => void;
    /** Additional class name */
    className?: string;
}
/**
 * Hover toolbar for message actions: React, Reply, Thread, Edit, Delete, Pin.
 */
declare const MessageActions: React.FC<MessageActionsProps>;

interface ThreadProps {
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
declare const Thread: React.FC<ThreadProps>;

interface ThreadHeaderProps {
    /** The parent message of the thread */
    thread: Message$1;
    /** Close the thread panel */
    onClose: () => void;
    /** Additional class name */
    className?: string;
}
/**
 * Header for the thread panel showing parent message preview and close button.
 */
declare const ThreadHeader: React.FC<ThreadHeaderProps>;

interface AvatarProps {
    /** Image URL */
    image?: string;
    /** User's display name (used for fallback initials) */
    name?: string;
    /** Size in pixels */
    size?: number;
    /** Shape of the avatar */
    shape?: "circle" | "square" | "rounded";
    /** Additional class name */
    className?: string;
    /** Whether the user is online */
    online?: boolean;
}
/**
 * Displays a user avatar with fallback initials and optional online indicator.
 *
 * @example
 * ```tsx
 * <Avatar image={user.avatar} name={user.displayName} size={40} online />
 * ```
 */
declare const Avatar: React.FC<AvatarProps>;

interface DateSeparatorProps {
    /** The date to display */
    date: Date;
    /** Custom date formatter */
    formatDate?: (date: Date) => string;
    /** Additional class name */
    className?: string;
}
/**
 * Renders a date divider between message groups from different days.
 *
 * @example
 * ```tsx
 * <DateSeparator date={new Date("2024-01-15")} />
 * ```
 */
declare const DateSeparator: React.FC<DateSeparatorProps>;

interface LoadingIndicatorProps {
    /** Size of the spinner in pixels */
    size?: number;
    /** Spinner color */
    color?: string;
    /** Loading text */
    text?: string;
    /** Additional class name */
    className?: string;
}
/**
 * A simple animated loading spinner.
 */
declare const LoadingIndicator: React.FC<LoadingIndicatorProps>;
interface LoadingErrorIndicatorProps {
    /** The error to display */
    error?: Error | string | null;
    /** Retry callback */
    onRetry?: () => void;
    /** Additional class name */
    className?: string;
}
/**
 * Displays an error state with an optional retry button.
 */
declare const LoadingErrorIndicator: React.FC<LoadingErrorIndicatorProps>;

interface EmptyStateIndicatorProps {
    /** The type of list that is empty */
    listType?: "message" | "room" | "thread" | "search";
    /** Custom text to display */
    text?: string;
    /** Additional class name */
    className?: string;
}
/**
 * Shown when a list (messages, rooms, threads, search results) is empty.
 *
 * @example
 * ```tsx
 * <EmptyStateIndicator listType="message" />
 * ```
 */
declare const EmptyStateIndicator: React.FC<EmptyStateIndicatorProps>;

interface ModalProps {
    /** Whether the modal is open */
    open: boolean;
    /** Close handler */
    onClose: () => void;
    /** Additional class name */
    className?: string;
}
/**
 * Overlay modal for image previews, confirmations, and dialogs.
 *
 * @example
 * ```tsx
 * <Modal open={showPreview} onClose={() => setShowPreview(false)}>
 *   <img src="..." alt="preview" />
 * </Modal>
 * ```
 */
declare const Modal: React.FC<PropsWithChildren<ModalProps>>;

interface SearchProps {
    /** Messages to search through */
    messages?: Message$1[];
    /** Callback when a result is selected */
    onSelectResult?: (message: Message$1) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Additional class name */
    className?: string;
}
/**
 * Client-side search component that filters messages.
 *
 * @example
 * ```tsx
 * <Search messages={messages} onSelectResult={msg => jumpTo(msg._id)} />
 * ```
 */
declare const Search: React.FC<SearchProps>;

export { Avatar, type AvatarProps, Chat, ChatContext, type ChatContextValue, ChatInput, type ChatProps, ChatProvider, ComponentContext, type ComponentContextValue, ComponentProvider, CreateDirectRoomInput, CreateGroupRoomInput, type CustomClasses, DateSeparator, type DateSeparatorProps, DeliveryStatus, EmptyStateIndicator, type EmptyStateIndicatorProps, type GroupStyle, HermesClient, HermesUser, LoadingErrorIndicator, type LoadingErrorIndicatorProps, LoadingIndicator, type LoadingIndicatorProps, MediaMessage, Message, MessageActions, type MessageActionsProps, MessageContext, type MessageContextValue, MessageList, type MessageProps, MessageProvider, MessageStatus, type MessageStatusProps, Modal, type ModalProps, OnlineBadge, Reaction, ReactionPicker, Room, RoomActionContext, type RoomActionContextValue, RoomActionProvider, RoomList, type RoomProps, RoomStateContext, type RoomStateContextValue, RoomStateProvider, Search, type SearchProps, SendMessageInput, Thread, ThreadHeader, type ThreadHeaderProps, type ThreadProps, TypingContext, type TypingContextValue, TypingIndicator, TypingProvider, UploadResult, Window, type WindowProps, useChatContext, useComponentContext, useMessageContext, useMessages, usePresence, useReactions, useReadReceipts, useRoomActionContext, useRoomStateContext, useRooms, useTyping, useTypingContext, useUpload };
