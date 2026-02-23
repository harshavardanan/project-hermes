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
  createdAt: Date;
}
