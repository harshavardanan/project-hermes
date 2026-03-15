import crypto from "crypto";
import "dotenv/config";

const ALGO = "aes-256-gcm";

const getKey = (): Buffer => {
  const raw = process.env.HERMES_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "[Hermes] HERMES_ENCRYPTION_KEY is not set in .env — add a 32-character string",
    );
  }
  // Pad or trim to exactly 32 bytes
  return Buffer.from(raw.padEnd(32, "0").slice(0, 32));
};

export const encrypt = (text: string): string => {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // Format: iv(hex):tag(hex):encrypted(hex)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decrypt = (payload: string): string => {
  const key = getKey();
  const [ivHex, tagHex, encryptedHex] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final("utf8");
};
