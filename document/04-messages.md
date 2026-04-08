# Messages

This section covers the lifecycle and UI presentation of individual messages inside a Hermes conversation.

## Messages Overview

To display a conversation feed, simply mount the `<MessageList>` component anywhere inside a `<Room>` provider. It automatically binds to the WebSocket layer, rendering new messages instantly.

Under the hood, `<MessageList>` maps over `<Message>` components. Each message is validated to determine if `isOwn` (sent by the connected user) to float it to the correct side of the flex container (your messages on the right, other people's messages on the left).

**Real Code Example: Standard Chat Area**
```tsx
import React from 'react';
import { Room, Window, MessageList, ChatInput } from "hermes-chat-react/react";

export const MainChatArea = ({ activeRoomId }) => {
  if(!activeRoomId) return <div className="m-auto">No Chat Active</div>;

  return (
    <Room roomId={activeRoomId}>
      {/* 
        Window forces MessageList to stretch and scroll, while 
        ChatInput stays pinned to the bottom 
      */}
      <Window className="flex flex-col h-full w-full bg-white relative">
        <div className="flex-1 overflow-y-auto w-full p-4">
          <MessageList />
        </div>
        
        <div className="p-4 border-t shrink-0">
          {/* Automatically handles keyboard, submission, and file attachment! */}
          <ChatInput 
            className="flex text-sm w-full" 
            inputClassName="flex-1 rounded-2xl bg-gray-100 px-4 py-2 border-none outline-none"
            placeholder="Type your message..."
          />
        </div>
      </Window>
    </Room>
  );
};
```

## Image and File Uploads

Upload logic is natively integrated directly into the `<ChatInput>`. The React interface checks the message `type` payload (`image`, `video`, `audio`, `document`, `link`) and automatically switches the internal renderer.

*   `type === 'image'`: Renders a full `<img src={url} />`
*   `type === 'video'`: Appends an HTML5 `<video controls />`
*   `type === 'document'`: Appends a downloadable `href` anchor tag displaying the `fileName`.

**Real Code Example: Manual File Uploading (Headless)**
If you want to build your own custom uploader completely from scratch instead of using `<ChatInput>`'s paperclip icon:
```tsx
import { useChatContext, useRoomContext } from "hermes-chat-react/react";

// Inside a component wrapped by <Room>
const CustomFileUploader = () => {
  const { client } = useChatContext();
  const { room } = useRoomContext();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !room) return;

    // First upload the file to your backend server to get a URL
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('https://api.yourdomain.com/upload', {
       method: 'POST', body: formData 
    });
    const { fileUrl } = await uploadRes.json();

    // Then broadcast a media message into the current Hermes Room
    await client.sendMessage(room._id, {
      text: "I sent a file!",
      type: "image", // or "document", "video"
      url: fileUrl
    });
  };

  return <input type="file" onChange={handleFileChange} />;
};
```


## Threads & Replies

Thread branching allows secondary conversations isolated from the main message feed.

To leverage Threads, you mount a `<Thread>` sibling next to your `<MessageList>`. When a user clicks "Reply in Thread" on a UI message bubble, the context signals the `<Thread>` panel to render.

**Real Code Example: Complex Thread Layout**
```tsx
import { Room, Window, MessageList, ChatInput, Thread } from "hermes-chat-react/react";

const AdvancedSplitViewChat = ({ roomId }) => {
  return (
    <Room roomId={roomId}>
      <div className="flex w-full h-full">
      
        {/* Main Feed */}
        <Window className="flex-1 flex flex-col relative border-r">
          <MessageList className="flex-1 overflow-y-auto" />
          <ChatInput className="shrink-0 p-3" />
        </Window>

        {/* 
           Secondary Thread Panel 
           It will remain rendering null/invisible until the user 
           triggers a thread context event from the main message list.
        */}
        <div className="w-[350px] h-full flex-shrink-0 bg-gray-50 lg:block hidden">
           <Thread autoFocus={true} />
        </div>
        
      </div>
    </Room>
  );
};
```

## Reactions

Emoji reactions are supported natively via the `<MessageActions>` hovering component. 

By default, the SDK injects an `<OnlineBadge>` and a `<ReactionPicker>` contextually onto the `Message` object. Clicking an emoji dispatches a `message.reaction` mutation up the active WebSocket context. The `<MessageList>` subscribes to this delta and repaints immediately without a page refresh!
