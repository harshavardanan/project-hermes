import { type IRoom } from "../models/Room.js";
export declare const createDirectRoom: (hermesUserIdA: string, hermesUserIdB: string, projectId: string) => Promise<IRoom>;
export declare const createGroupRoom: (creatorId: string, projectId: string, name: string, memberIds: string[], description?: string, avatar?: string) => Promise<IRoom>;
export declare const deleteRoom: (roomId: string, hermesUserId: string) => Promise<{
    success: boolean;
    error?: string;
}>;
export declare const addMember: (roomId: string, requesterId: string, newMemberId: string) => Promise<{
    success: boolean;
    error?: string;
}>;
export declare const removeMember: (roomId: string, requesterId: string, targetId: string) => Promise<{
    success: boolean;
    error?: string;
}>;
export declare const getUserRooms: (hermesUserId: string) => Promise<{
    id: import("mongoose").Types.ObjectId;
    unreadCount: number;
    isMuted: boolean;
    isPinned: boolean;
    name?: string;
    type: import("../models/Room.js").RoomType;
    projectId: import("mongoose").Types.ObjectId;
    createdBy: import("mongoose").Types.ObjectId;
    members: import("mongoose").Types.ObjectId[];
    admins: import("mongoose").Types.ObjectId[];
    avatar?: string;
    description?: string;
    lastMessage?: import("mongoose").Types.ObjectId;
    lastActivity: Date;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    _id: import("mongoose").Types.ObjectId;
    $locals: Record<string, unknown>;
    $op: "save" | "validate" | "remove" | null;
    $where: Record<string, unknown>;
    baseModelName?: string;
    collection: import("mongoose").Collection;
    db: import("mongoose").Connection;
    errors?: import("mongoose").Error.ValidationError;
    isNew: boolean;
    schema: import("mongoose").Schema;
    __v: number;
}[]>;
export declare const getRoom: (roomId: string, hermesUserId: string) => Promise<{
    room?: IRoom;
    error?: string;
}>;
//# sourceMappingURL=roomService.d.ts.map