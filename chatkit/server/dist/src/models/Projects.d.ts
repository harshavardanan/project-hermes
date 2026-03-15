import mongoose, { Document, Types } from "mongoose";
export interface IProject extends Document {
    projectName: string;
    userId: Types.ObjectId;
    projectId: string;
    apiKey: string;
    secret: string;
    region: string;
    endpoint: string;
    plan: Types.ObjectId;
    usage: {
        dailyTokens: number;
        totalTokensAllTime: number;
        lastResetDate: Date;
    };
    createdAt: Date;
}
export declare const Project: mongoose.Model<any, {}, {}, {}, any, any, any>;
//# sourceMappingURL=Projects.d.ts.map