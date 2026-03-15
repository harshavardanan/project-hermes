export interface HermesTokenPayload {
    hermesId: string;
    externalId: string;
    username: string;
}
export declare const signToken: (payload: HermesTokenPayload) => string;
export declare const verifyToken: (token: string) => HermesTokenPayload;
//# sourceMappingURL=jwt.d.ts.map