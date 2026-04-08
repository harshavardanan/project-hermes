# Hermes Chat SDK Documentation

Welcome to the official, comprehensive documentation for the **Hermes Chat SDK** (`hermes-chat-react`). This documentation covers everything from initial setup to advanced UI customization.

## Table of Contents

1. **[Quick Start & Architecture](./01-quick-start.md)**
   * React Introduction
   * Architecture & Benchmark
   * Hello World Tutorial
2. **[Init and Users](./02-init-and-users.md)**
   * Tokens & Authentication
   * Initialization & Users (`HermesClient`)
   * Managing User States (Presence & Typing)
3. **[Channels (Rooms)](./03-channels.md)**
   * Creating Channels (Direct vs Group)
   * Querying Channels (`getHistory`, `useRooms`)
   * Channel Members & Pagination
4. **[Messages](./04-messages.md)**
   * Messages Overview (`MessageList`, `Message`)
   * Image and File Uploads
   * Threads & Replies
   * Reactions
5. **[Core React Components](./05-core-components.md)**
   * The Context Architecture (`<Chat>`, `<Room>`)
   * Layout Components (`<RoomList>`, `<Window>`, `<Thread>`)
   * UI Engines (`<MessageList>`, `<ChatInput>`)
6. **[Customization](./06-customization.md)**
   * Theming via CSS and `customClasses`
   * Advanced render overrides (`renderMessage`, `renderRoomItem`)
