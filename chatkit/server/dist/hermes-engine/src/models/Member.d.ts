import { Document, Types } from "mongoose";
export interface IMember extends Document {
    roomId: Types.ObjectId;
    hermesUserId: Types.ObjectId;
    lastRead?: Types.ObjectId;
    lastReadAt?: Date;
    unreadCount: number;
    isMuted: boolean;
    isPinned: boolean;
    joinedAt: Date;
    leftAt?: Date;
    isActive: boolean;
}
export declare const Member: import("mongoose").Model<IMember, {}, {}, {}, Document<unknown, {}, IMember, {}, import("mongoose").DefaultSchemaOptions> & IMember & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMember>;
//# sourceMappingURL=Member.d.ts.map