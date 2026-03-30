#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline/promises";

// Basic CLI argument parsing
const args = process.argv.slice(2);
const command = args[0];

if (command !== "init") {
  console.log(`
Hermes CLI Usage:

  npx hermes init    Creates a boilerplate hermes.config.ts file
`);
  process.exit(1);
}

const run = async () => {
  console.log("Welcome to Hermes CLI! 🚀");
  console.log("Let's set up your hermes.config.ts.\\n");
  console.log("Press Enter to skip any field and use a placeholder to paste later.\\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
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

  const configPath = path.join(process.cwd(), "hermes.config.ts");
  
  if (fs.existsSync(configPath)) {
    console.log("\\n⚠️  hermes.config.ts already exists in this directory. Aborting to avoid overwrite.");
    process.exit(1);
  }

  fs.writeFileSync(configPath, configContent, "utf-8");
  console.log(`\\n✅ Successfully created hermes.config.ts`);
  console.log("You can now import this configuration into your application.");
};

run().catch((err) => {
  console.error("An error occurred during initialization:", err);
  process.exit(1);
});
