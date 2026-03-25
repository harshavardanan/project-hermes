import { Document } from "mongoose";

// Make sure 'export' is here!
export interface IUser extends Document {
  googleId?: string;
  githubId?: string;
  microsoftId?: string;
  displayName: string;
  isAdmin?: boolean;
  email: string;
  avatar?: string;
  status?: "Active" | "Suspended";
  plan?: any;
  dailyTokensUsed?: number;
  dailyTokensReset?: Date;
  createdAt: Date;
}
