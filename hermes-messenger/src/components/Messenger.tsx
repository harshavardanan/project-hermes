import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { useHermes } from "../lib/hermes";
import { useAuthStore } from "../store/authStore";
import {
  Chat,
  Room,
  Window,
  RoomList,
  MessageList,
  ChatInput,
  Thread,
  Search,
  useRooms
} from "hermes-chat-react/react";
import type { Room as RoomType, Message, HermesClient, HermesUser } from "hermes-chat-react";

interface MessengerInnerProps {
  client: HermesClient;
  hermesUser: HermesUser;
  logout: () => void;
}

const MessengerInner: React.FC<MessengerInnerProps> = ({ client, hermesUser, logout }) => {
  // Track the active room locally.
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Fetch rooms list from the old hook
  const { rooms, loading: roomsLoading } = useRooms(client);

  // Handle a direct message search result click (jumping to roomId)
  const handleSearchResult = (msg: Message) => {
    if (msg.roomId) {
      setActiveRoomId(msg.roomId);
    }
  };

  return (
    <Chat client={client}>
      <div className="flex h-screen w-full bg-white text-gray-900 overflow-hidden font-sans">
        
        {/* Sidebar */}
        <div className="w-80 flex flex-col border-r border-gray-200 bg-gray-50">
          
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm z-10">
            <h2 className="text-lg font-semibold tracking-tight text-gray-800">Hermes</h2>
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto relative">
            {/* Minimal Search Component over the Room List */}
            <div className="p-3 sticky top-0 bg-gray-50 z-10 border-b border-gray-200/50">
              <Search 
                 onSelectResult={handleSearchResult} 
                 placeholder="Search messages..."
                 className="w-full text-sm"
              />
            </div>

            <RoomList
              rooms={rooms}
              loading={roomsLoading}
              currentUserId={hermesUser.userId}
              activeRoomId={activeRoomId || undefined}
              onSelectRoom={(r: RoomType) => setActiveRoomId(r._id)}
              className="mt-2"
              itemClassName="mx-2 mb-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            />
          </div>

          {/* User Profile / Status Footer */}
          <div className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
              {hermesUser.displayName?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {hermesUser.displayName}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                Online
              </p>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex bg-white relative">
          {activeRoomId ? (
            <Room roomId={activeRoomId}>
              {/* Window contains the message list and chat input */}
              <Window className="flex-1 flex flex-col overflow-hidden relative border-r border-gray-100 last:border-r-0">
                
                {/* Minimal Header */}
                <div className="h-14 flex items-center px-6 border-b border-gray-100 bg-white z-10">
                   <h3 className="font-medium text-gray-700">Chat</h3>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30">
                  <MessageList className="h-full" />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <ChatInput 
                    className="flex text-sm" 
                    inputClassName="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-2 border-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-shadow"
                  />
                </div>
              </Window>

              {/* Thread component binds dynamically to context if a message's thread is actively opened */}
              <div className="h-full bg-gray-50 flex-shrink-0">
                <Thread autoFocus={true} />
              </div>
            </Room>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-1">No Chat Selected</h3>
              <p className="text-sm">Select a conversation from the sidebar to start.</p>
            </div>
          )}
        </div>

      </div>
    </Chat>
  );
};

export const Messenger: React.FC = () => {
  const { client, user: hermesUser, status } = useHermes();
  const { logout } = useAuthStore();

  if (status === "connecting" || status === "idle" || !client || !hermesUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">
        <p>{status === "idle" ? "Initializing..." : "Connecting..."}</p>
      </div>
    );
  }

  return <MessengerInner client={client} hermesUser={hermesUser} logout={logout} />;
};
