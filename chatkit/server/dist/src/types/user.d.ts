import { Document } from "mongoose";
export interface IUser extends Document {
    googleId?: string;
    githubId?: string;
    microsoftId?: string;
    displayName: string;
    isAdmin?: boolean;
    email: string;
    avatar?: string;
    createdAt: Date;
}
//# sourceMappingURL=user.d.ts.map