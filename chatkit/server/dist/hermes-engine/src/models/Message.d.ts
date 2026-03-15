import { Document, Types } from "mongoose";
export type MessageType = "text" | "link" | "image" | "video" | "audio" | "document";
export type DeliveryStatus = "sent" | "delivered" | "seen";
export interface IReaction {
    emoji: string;
    users: Types.ObjectId[];
}
export interface IMessage extends Document {
    roomId: Types.ObjectId;
    senderId: Types.ObjectId;
    type: MessageType;
    text?: string;
    url?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    thumbnail?: string;
    replyTo?: Types.ObjectId;
    reactions: IReaction[];
    deliveryStatus: DeliveryStatus;
    seenBy: Types.ObjectId[];
    isDeleted: boolean;
    deletedAt?: Date;
    editedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Message: import("mongoose").Model<IMessage, {}, {}, {}, Document<unknown, {}, IMessage, {}, import("mongoose").DefaultSchemaOptions> & IMessage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMessage>;
//# sourceMappingURL=Message.d.ts.map