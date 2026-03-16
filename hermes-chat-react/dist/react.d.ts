import { HermesClient, Message, SendMessageInput, Room, CreateDirectRoomInput, CreateGroupRoomInput, Reaction, UploadResult, HermesUser } from './index.js';
export { ConnectResponse, ConnectionStatus, DeliveryStatus, HermesConfig, HermesEvents, LastSeenEvent, MessageHistoryResult, MessageType, PresenceEvent, ReactionEvent, ReceiptEvent, RoomType, TypingEvent } from './index.js';
import React from 'react';

declare const useMessages: (client: HermesClient, roomId: string | null) => {
    messages: Message[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    typingUsers: {
        userId: string;
        displayName: string;
    }[];
    sendMessage: (input: Omit<SendMessageInput, "roomId">) => Promise<Message>;
    editMessage: (messageId: string, text: string) => Promise<Message>;
    deleteMessage: (messageId: string) => Promise<void>;
    addReaction: (messageId: string, emoji: string) => Promise<void>;
    loadMore: () => Promise<void>;
};

declare const useRooms: (client: HermesClient) => {
    rooms: Room[];
    loading: boolean;
    error: string | null;
    createDirect: (input: CreateDirectRoomInput) => Promise<Room>;
    createGroup: (input: CreateGroupRoomInput) => Promise<Room>;
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
    sendFile: (roomId: string, file: File, replyTo?: string) => Promise<Message | null>;
    validate: (file: File, maxMb?: number) => string | null;
    uploading: boolean;
    error: string | null;
    lastUpload: UploadResult | null;
};

interface MessageListProps {
    messages: Message[];
    currentUser: HermesUser;
    loading?: boolean;
    loadingMore?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onEdit?: (messageId: string, text: string) => void;
    onDelete?: (messageId: string) => void;
    onReact?: (messageId: string, emoji: string) => void;
    onReply?: (message: Message) => void;
    renderMessage?: (message: Message, isOwn: boolean) => React.ReactNode;
    renderAvatar?: (senderId: string) => React.ReactNode;
    className?: string;
    autoScroll?: boolean;
    typingUsers?: {
        userId: string;
        displayName: string;
    }[];
}
declare const MessageList: React.FC<MessageListProps>;

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
declare const ChatInput: React.FC<ChatInputProps>;

interface RoomListProps {
    rooms: Room[];
    activeRoomId?: string | null;
    currentUserId: string;
    loading?: boolean;
    onSelectRoom: (room: Room) => void;
    onCreateDirect?: () => void;
    onCreateGroup?: () => void;
    renderRoomItem?: (room: Room, isActive: boolean) => React.ReactNode;
    renderAvatar?: (room: Room) => React.ReactNode;
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
    message: Message;
    className?: string;
    maxWidth?: number | string;
}
declare const MediaMessage: React.FC<MediaMessageProps>;

export { ChatInput, CreateDirectRoomInput, CreateGroupRoomInput, HermesClient, HermesUser, MediaMessage, Message, MessageList, OnlineBadge, Reaction, ReactionPicker, Room, RoomList, SendMessageInput, TypingIndicator, UploadResult, useMessages, usePresence, useReactions, useReadReceipts, useRooms, useTyping, useUpload };
