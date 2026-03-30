#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_promises = __toESM(require("readline/promises"), 1);
var args = process.argv.slice(2);
var command = args[0];
if (command !== "init") {
  console.log(`
Hermes CLI Usage:

  npx hermes init    Creates a boilerplate hermes.config.ts file
`);
  process.exit(1);
}
var run = async () => {
  console.log("Welcome to Hermes CLI! \u{1F680}");
  console.log("Let's set up your hermes.config.ts.\\n");
  console.log("Press Enter to skip any field and use a placeholder to paste later.\\n");
  const rl = import_promises.default.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const endpoint = await rl.question("Hermes API Endpoint (e.g., http://localhost:8080): ");
  const apiKey = await rl.question("API Key: ");
  const secret = await rl.question("API Secret: ");
  const userId = await rl.question("Your User ID (e.g., user-123): ");
  const displayName = await rl.question("Your Display Name (e.g., Alice): ");
  rl.close();
  const configContent = `// Auto-generated Hermes Configuration
// Paste your credentials below to connect to the Hermes server.
export const hermesConfig = {
  endpoint: "${endpoint || "http://localhost:8080"}",
  apiKey: "${apiKey || "YOUR_API_KEY"}",
  secret: "${secret || "YOUR_SECRET"}",
  userId: "${userId || "user-123"}",
  displayName: "${displayName || "User"}",
};

/*
 * Example Usage:
 *
 * import { hermesConfig } from './hermes.config';
 * import { HermesClient } from 'hermes-chat-react';
 * 
 * const client = new HermesClient(hermesConfig);
 * await client.connect();
 */
`;
  const configPath = import_path.default.join(process.cwd(), "hermes.config.ts");
  if (import_fs.default.existsSync(configPath)) {
    console.log("\\n\u26A0\uFE0F  hermes.config.ts already exists in this directory. Aborting to avoid overwrite.");
    process.exit(1);
  }
  import_fs.default.writeFileSync(configPath, configContent, "utf-8");
  console.log(`\\n\u2705 Successfully created hermes.config.ts`);
  console.log("You can now import this configuration into your application.");
};
run().catch((err) => {
  console.error("An error occurred during initialization:", err);
  process.exit(1);
});
//# sourceMappingURL=cli.cjs.map