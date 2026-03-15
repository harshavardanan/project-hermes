import type { Request, Response, NextFunction } from "express";
import type { Socket } from "socket.io";
export interface HermesTokenPayload {
    hermesUserId: string;
    externalId: string;
    projectId: string;
    displayName: string;
    apiKey: string;
}
export declare const signHermesToken: (payload: HermesTokenPayload) => string;
export declare const verifyHermesToken: (token: string) => HermesTokenPayload;
export declare const hermesAuth: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const hermesSocketAuth: (socket: Socket, next: (err?: Error) => void) => Promise<void>;
export declare const validateProjectCredentials: (apiKey: string, secret: string) => Promise<{
    valid: boolean;
    project?: any;
    error?: string;
}>;
//# sourceMappingURL=auth.d.ts.map