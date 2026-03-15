import React from "react";
import type { Message, HermesUser } from "../../types/index";
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
export declare const MessageList: React.FC<MessageListProps>;
export {};
//# sourceMappingURL=MessageList.d.ts.map