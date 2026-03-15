import { Document } from "mongoose";
export interface IPlan extends Document {
    planId: string;
    name: string;
    dailyLimit: number;
    monthlyPrice: number;
    features: string[];
}
export declare const Plan: import("mongoose").Model<IPlan, {}, {}, {}, Document<unknown, {}, IPlan, {}, import("mongoose").DefaultSchemaOptions> & IPlan & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPlan>;
//# sourceMappingURL=Plans.d.ts.map