import jwt from "jsonwebtoken";

const SECRET = process.env.HERMES_JWT_SECRET as string;

export interface HermesTokenPayload {
  hermesId: string;
  externalId: string;
  username: string;
}

export const signToken = (payload: HermesTokenPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): HermesTokenPayload => {
  return jwt.verify(token, SECRET) as HermesTokenPayload;
};
