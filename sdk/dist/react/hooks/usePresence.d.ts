import type { HermesClient } from "../../core/HermesClient";
export declare const usePresence: (client: HermesClient) => {
    isOnline: (userId: string) => boolean;
    onlineUsers: string[];
    onlineMap: Map<string, boolean>;
};
//# sourceMappingURL=usePresence.d.ts.map