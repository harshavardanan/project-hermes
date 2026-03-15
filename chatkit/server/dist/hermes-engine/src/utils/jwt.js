import jwt from "jsonwebtoken";
const SECRET = process.env.HERMES_JWT_SECRET;
export const signToken = (payload) => {
    return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};
export const verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};
//# sourceMappingURL=jwt.js.map