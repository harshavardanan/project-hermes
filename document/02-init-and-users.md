# Initialization and Users

Before interacting with chat UI components, you must initialize the `HermesClient` and authenticate your user session. The SDK handles both initial HTTP authentication and underlying WebSocket connections seamlessly.

## Tokens & Authentication

To connect to Hermes, you have two authentication strategies:
1. **API Key & Secret**: (Primarily for backend or development environments).
2. **JWT Token**: (Best practice for production client-side applications).

### Connecting with API Key & Secret

If you are prototyping, you can pass your project's raw credentials directly to the client.

```typescript
import { HermesClient } from "hermes-chat-react";

const client = new HermesClient({
  endpoint: "https://api.yourdomain.com",
  apiKey: "YOUR_API_KEY",
  secret: "YOUR_SECRET_KEY",
  userId: "user-123",
  displayName: "Alice",
  avatar: "https://example.com/alice.jpg", // Optional
  email: "alice@example.com", // Optional
});

// Await connection to receive the hydrated HermesUser object
const user = await client.connect();
console.log("Connected as:", user.displayName);
```

### Connecting with a Pre-Generated Token

In production, you should *never* expose your `secret` key on the client side. Instead, your backend should generate a JWT and pass it to the frontend.

```typescript
const client = new HermesClient({
  endpoint: "https://api.yourdomain.com",
  token: "eyJhbGciOiJIUzI1NiIsInR5...", // Secure JWT from your backend
});

await client.connect();
```

## Initialization & Managing Users

When `client.connect()` is called, the SDK attempts to connect to the `/hermes/connect` endpoint, validates credentials, and establishes a WebSocket connection.

### Catching Connection Errors

You should wrap your connection logic in a `try/catch` matrix to handle missing endpoints or declined credentials.

```typescript
try {
  await client.connect();
} catch (error) {
  console.error("Failed to authenticate with Hermes:", error.message);
}
```

### Querying the User Directory

If you need to search for other members to start a conversation, the SDK exposes the `getUsers()` API. This requires an active connection.

```typescript
// Fetches an array of all available HermesUsers in the workspace
const directory = await client.getUsers();

directory.forEach(user => {
  console.log(user.userId, user.displayName, user.avatar);
});
```

### Connecting React Context

Once your `HermesClient` is securely connected, you must pass it to the `<Chat>` component. This injects the `HermesUser` payload throughout the React DOM tree.

```tsx
import { Chat } from "hermes-chat-react/react";

<Chat client={client}>
  {/* The rest of your app */}
</Chat>
```
