import type { HermesClient } from "../../core/HermesClient";
export declare const useTyping: (client: HermesClient, roomId: string | null) => {
    typingUsers: Map<string, string>;
    typingText: string | null;
    isAnyoneTyping: boolean;
    startTyping: () => void;
    stopTyping: () => void;
};
//# sourceMappingURL=useTyping.d.ts.map