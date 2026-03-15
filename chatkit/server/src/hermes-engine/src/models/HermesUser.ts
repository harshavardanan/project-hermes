import { Schema, model, Document, Types } from "mongoose";

export interface IHermesUser extends Document {
  externalId: string; // Dan's _id in Joe's own database
  projectId: Types.ObjectId; // which project (Joe's) they belong to
  displayName: string;
  avatar?: string;
  email?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const hermesUserSchema = new Schema<IHermesUser>(
  {
    externalId: { type: String, required: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    displayName: { type: String, required: true },
    avatar: { type: String },
    email: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// A user is unique per project — Dan in Joe's app ≠ Dan in another app
hermesUserSchema.index({ externalId: 1, projectId: 1 }, { unique: true });
hermesUserSchema.index({ projectId: 1 });

export const HermesUser = model<IHermesUser>("HermesUser", hermesUserSchema);
