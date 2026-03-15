import { Document, Types } from "mongoose";
export type RoomType = "direct" | "group";
export interface IRoom extends Document {
    name?: string;
    type: RoomType;
    projectId: Types.ObjectId;
    createdBy: Types.ObjectId;
    members: Types.ObjectId[];
    admins: Types.ObjectId[];
    avatar?: string;
    description?: string;
    lastMessage?: Types.ObjectId;
    lastActivity: Date;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Room: import("mongoose").Model<IRoom, {}, {}, {}, Document<unknown, {}, IRoom, {}, import("mongoose").DefaultSchemaOptions> & IRoom & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRoom>;
//# sourceMappingURL=Room.d.ts.map