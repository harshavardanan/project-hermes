import type { HermesClient } from "../../core/HermesClient";
import type { Message, SendMessageInput } from "../../types/index";
export declare const useMessages: (client: HermesClient, roomId: string | null) => {
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
//# sourceMappingURL=useMessages.d.ts.map