import React, { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";
import type { HermesClient } from "../../core/HermesClient";
import type { HermesUser, Room } from "../../types/index";

export type CustomClasses = Partial<
  Record<
    | "chat"
    | "roomList"
    | "room"
    | "messageList"
    | "message"
    | "thread"
    | "window",
    string
  >
>;

export interface ChatContextValue {
  /** The HermesClient instance powering the SDK */
  client: HermesClient;
  /** The currently connected user */
  currentUser: HermesUser | null;
  /** Visual theme identifier */
  theme: string;
  /** The currently active room */
  activeRoom?: Room;
  /** Set the active room */
  setActiveRoom: (room?: Room) => void;
  /** Open mobile navigation */
  openMobileNav: () => void;
  /** Close mobile navigation */
  closeMobileNav: () => void;
  /** Whether mobile nav is open */
  navOpen: boolean;
  /** Custom CSS class overrides for main SDK containers */
  customClasses?: CustomClasses;
}

export const ChatContext = createContext<ChatContextValue | undefined>(
  undefined
);

export const ChatProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: ChatContextValue }>) => (
  <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
);

/**
 * Access the ChatContext. Must be used within a `<Chat>` component.
 */
export const useChatContext = (componentName?: string): ChatContextValue => {
  const contextValue = useContext(ChatContext);
  if (!contextValue) {
    console.warn(
      `useChatContext was called outside of ChatProvider. Make sure this hook is called within a child of the <Chat> component.${componentName ? ` Errored in: ${componentName}` : ""}`
    );
    return {} as ChatContextValue;
  }
  return contextValue;
};
