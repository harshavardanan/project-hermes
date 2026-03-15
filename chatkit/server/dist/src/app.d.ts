import http from "http";
import express from "express";
import { Server } from "socket.io";
import "dotenv/config";
import "./config/passport.js";
export declare function start(): Promise<{
    app: express.Application;
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
}>;
//# sourceMappingURL=app.d.ts.map