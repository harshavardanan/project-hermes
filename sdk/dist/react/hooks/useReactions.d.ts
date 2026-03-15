import type { HermesClient } from "../../core/HermesClient";
import type { Reaction } from "../../types/index";
export declare const useReactions: (client: HermesClient, roomId: string | null) => {
    react: (messageId: string, emoji: string) => Promise<void>;
    hasReacted: (reactions: Reaction[], emoji: string) => boolean;
    getCount: (reactions: Reaction[], emoji: string) => number;
    getEmojis: (reactions: Reaction[]) => string[];
};
//# sourceMappingURL=useReactions.d.ts.map