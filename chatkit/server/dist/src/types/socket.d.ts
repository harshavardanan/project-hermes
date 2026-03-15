export type PlanType = "FREE" | "STANDARD" | "PRO";
export type RetentionPolicy = number | "infinite";
export interface PlanLimits {
    maxUsers: number | "unlimited";
    maxGroups: number | "unlimited";
    retentionDays: RetentionPolicy;
}
export interface SocketCtx {
    projectId: string;
    userId: string;
    plan: PlanType;
    createdBy: string;
    status: "active" | "revoked";
    limits: PlanLimits;
}
/**
 * Payload types (used by handlers)
 */
export interface DmSendPayload {
    toUserId: string;
    text: string;
}
export interface GroupJoinPayload {
    groupId: string;
}
export interface GroupSendPayload {
    groupId: string;
    text: string;
}
export interface TypingPayload {
    conversationId: string;
    isTyping: boolean;
}
/**
 * Message event shape (emitted to clients)
 */
export interface RealtimeMessage {
    type: "DM" | "GROUP";
    conversationId: string;
    from: string;
    to?: string;
    text: string;
    createdAt: string;
}
//# sourceMappingURL=socket.d.ts.map