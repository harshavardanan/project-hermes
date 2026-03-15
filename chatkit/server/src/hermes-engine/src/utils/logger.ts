const time = () => new Date().toISOString();

export const logger = {
  info: (msg: string, ...args: any[]) =>
    console.log(`\x1b[32m[Hermes][INFO]\x1b[0m ${time()} ${msg}`, ...args),

  warn: (msg: string, ...args: any[]) =>
    console.warn(`\x1b[33m[Hermes][WARN]\x1b[0m ${time()} ${msg}`, ...args),

  error: (msg: string, ...args: any[]) =>
    console.error(`\x1b[31m[Hermes][ERROR]\x1b[0m ${time()} ${msg}`, ...args),

  socket: (event: string, hermesId: string, ...args: any[]) =>
    console.log(
      `\x1b[36m[Hermes][SOCKET]\x1b[0m ${time()} [${hermesId}] ${event}`,
      ...args,
    ),
};
