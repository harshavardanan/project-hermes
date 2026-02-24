import { Schema, model, Document } from "mongoose";

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

const docSchema = new Schema<IDoc>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    content: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    lastUpdated: { type: Date, default: Date.now },
    order: { type: Number, default: 0 },
    category: { type: String, default: "General" },
  },
  {
    timestamps: true,
  },
);

export const Doc = model<IDoc>("Doc", docSchema);
