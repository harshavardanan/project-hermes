import React from "react";
import type { Message } from "../../types/index";
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
export declare const ChatInput: React.FC<ChatInputProps>;
export {};
//# sourceMappingURL=ChatInput.d.ts.map