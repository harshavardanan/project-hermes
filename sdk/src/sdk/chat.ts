import { io } from "socket.io-client";

type Config = {
  url: string;
  apiKey: string;
  userId: string;
};

export function createChatSDK(cfg: Config) {
  let socket: any;
  let readyCb: any;
  let msgCb: any;

  function connect() {
    socket = io(cfg.url, {
      auth: { apiKey: cfg.apiKey, userId: cfg.userId },
    });

    socket.on("sdk:ready", (d: any) => readyCb?.(d));
    socket.on("message:new", (m: any) => msgCb?.(m));
  }

  function disconnect() {
    socket?.disconnect();
  }

  function sendDM(toUserId: string, text: string) {
    socket.emit("dm:send", { toUserId, text });
  }

  return {
    connect,
    disconnect,
    sendDM,
    onReady: (cb: any) => (readyCb = cb),
    onMessage: (cb: any) => (msgCb = cb),
  };
}
