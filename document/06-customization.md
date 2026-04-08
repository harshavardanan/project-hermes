# UI Customization & Theming

Hermes components have strict internal structure (usually flexing layout properly), but they do not enforce colors. You can heavily modify UI presentation using two approaches: overriding CSS context and React Render Props.

## Overriding via `customClasses`

If your UI is suffering from squashed grids or container issues, the global `<Chat>` container accepts a `customClasses` prop. You can pass raw Tailwind utility strings directly into the component's internal wrappers.

```tsx
<Chat 
  client={client} 
  theme="dark" 
  customClasses={{ 
    chat: "w-full h-full flex flex-col items-center",
    room: "flex-1 w-full min-w-0" // Forces the feed to respond responsively
  }}
>
```

## Theming via CSS (`var()`)

As a best practice in modern apps, target the `.hermes-chat` class via standard `index.css` overrides.

```css
/* index.css */
:root {
  --brand-bg: #0a0a0a;
  --brand-text: #ffffff;
  --brand-accent: #111113;
}

.hermes-chat--dark {
  background-color: var(--brand-bg);
  color: var(--brand-text);
}
```

## Advanced Logic: `renderProps`

For deeper modifications—such as rendering custom avatars fetched from Google, or conditionally turning messages into complex UI cards—pass an override renderer directly into the component!

### Overriding Room Selection UI
```tsx
<RoomList 
  onSelectRoom={handleSelect}
  renderRoomItem={(room, isActive) => (
    <div className={`p-4 rounded ${isActive ? 'bg-blue-500' : 'bg-transparent'}`}>
      <span className="font-bold">{room.name}</span>
      <span className="text-xs text-gray-500">{room.members.length} members</span>
    </div>
  )}
/>
```

### Overriding the Chat Bubbles (Dark Mode Example)

By providing a custom `renderMessage` to `MessageList`, you assume absolute control of message presentation. You must handle the `isOwn` logic (to dictate alignment) and manually invoke formatting logic.

```tsx
<MessageList
  className="h-full"
  renderMessage={(message, isOwn) => {
    // Basic deleted check
    if (message.isDeleted) return <div className="italic text-gray-400">Message deleted</div>;
    
    return (
      <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} mb-3 gap-2`}>
        
        {/* Avatar Placeholder for other users */}
        {!isOwn && (
          <div className="w-8 h-8 rounded-full bg-gray-500" />
        )}

        <div className={`px-4 py-2 rounded-2xl ${isOwn ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"}`}>
          {message.type === 'text' && <p>{message.text}</p>}
          {message.type === 'image' && <img src={message.url} alt="attachment" />}
        </div>
      </div>
    );
  }}
/>
```

When you write a custom `renderMessage` function, the SDK automatically disables its internal `<Message>` DOM structure and replaces it with your custom payload, guaranteeing total visual perfection for your app.
