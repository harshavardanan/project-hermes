import { Document } from "mongoose";
export interface IDoc extends Document {
    title: string;
    slug: string;
    description?: string;
    content: any;
    status: "draft" | "published";
    lastUpdated: Date;
    order: number;
    category: string;
}
export declare const Doc: import("mongoose").Model<IDoc, {}, {}, {}, Document<unknown, {}, IDoc, {}, import("mongoose").DefaultSchemaOptions> & IDoc & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDoc>;
//# sourceMappingURL=Document.d.ts.map