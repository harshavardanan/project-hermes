import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { PropsWithChildren } from "react";
import type { HermesClient } from "../../../core/HermesClient";
import type { Room, HermesUser } from "../../../types/index";
import { ChatProvider } from "../../context/ChatContext";
import type { CustomClasses } from "../../context/ChatContext";

export interface ChatProps {
  /** The HermesClient instance */
  client: HermesClient;
  /** Visual theme identifier, defaults to "light" */
  theme?: string;
  /** Custom CSS class overrides */
  customClasses?: CustomClasses;
  /** Initial mobile nav state */
  initialNavOpen?: boolean;
}

/**
 * Root wrapper component for the Hermes Chat SDK.
 *
 * Provides `ChatContext` to all child components. Place this at the top
 * of your chat UI tree.
 *
 * @example
 * ```tsx
 * const client = new HermesClient({ endpoint, apiKey, secret, userId, displayName });
 * await client.connect();
 *
 * <Chat client={client} theme="dark">
 *   <RoomList />
 *   <Room roomId={activeRoomId}>
 *     <Window>
 *       <MessageList />
 *       <ChatInput />
 *     </Window>
 *   </Room>
 * </Chat>
 * ```
 */
export const Chat = ({
  client,
  theme = "light",
  customClasses,
  initialNavOpen = false,
  children,
}: PropsWithChildren<ChatProps>) => {
  const [activeRoom, setActiveRoom] = useState<Room | undefined>(undefined);
  const [navOpen, setNavOpen] = useState(initialNavOpen);
  const [currentUser, setCurrentUser] = useState<HermesUser | null>(
    client.currentUser
  );

  // Keep currentUser in sync if client connects after mounting
  useEffect(() => {
    if (client.currentUser) {
      setCurrentUser(client.currentUser);
    }
    const onConnected = () => setCurrentUser(client.currentUser);
    client.on("connected", onConnected);
    return () => {
      client.off("connected", onConnected);
    };
  }, [client]);

  const openMobileNav = useCallback(() => setNavOpen(true), []);
  const closeMobileNav = useCallback(() => setNavOpen(false), []);

  const handleSetActiveRoom = useCallback(
    (room?: Room) => {
      setActiveRoom(room);
      // auto-close mobile nav when selecting a room
      setNavOpen(false);
    },
    []
  );

  const chatContextValue = useMemo(
    () => ({
      client,
      currentUser,
      theme,
      activeRoom,
      setActiveRoom: handleSetActiveRoom,
      openMobileNav,
      closeMobileNav,
      navOpen,
      customClasses,
    }),
    [
      client,
      currentUser,
      theme,
      activeRoom,
      handleSetActiveRoom,
      openMobileNav,
      closeMobileNav,
      navOpen,
      customClasses,
    ]
  );

  const containerClass =
    customClasses?.chat || `hermes-chat hermes-chat--${theme}`;

  return (
    <ChatProvider value={chatContextValue}>
      <div className={containerClass}>{children}</div>
    </ChatProvider>
  );
};
