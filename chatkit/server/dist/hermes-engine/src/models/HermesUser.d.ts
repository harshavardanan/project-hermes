import { Document, Types } from "mongoose";
export interface IHermesUser extends Document {
    externalId: string;
    projectId: Types.ObjectId;
    displayName: string;
    avatar?: string;
    email?: string;
    isOnline: boolean;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const HermesUser: import("mongoose").Model<IHermesUser, {}, {}, {}, Document<unknown, {}, IHermesUser, {}, import("mongoose").DefaultSchemaOptions> & IHermesUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IHermesUser>;
//# sourceMappingURL=HermesUser.d.ts.map