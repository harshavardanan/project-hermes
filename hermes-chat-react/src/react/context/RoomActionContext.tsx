import React, { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";
import type { Message, SendMessageInput } from "../../types/index";

export interface RoomActionContextValue {
  /** Send a message to the current room */
  sendMessage: (
    input: Omit<SendMessageInput, "roomId">
  ) => Promise<Message>;
  /** Edit a message */
  editMessage: (messageId: string, text: string) => Promise<Message>;
  /** Delete a message */
  deleteMessage: (messageId: string) => Promise<void>;
  /** Add a reaction to a message */
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  /** Load older messages */
  loadMore: () => Promise<void>;
  /** Mark room as seen */
  markRead: (lastMessageId: string) => Promise<void>;
  /** Open a thread for a specific message */
  openThread: (message: Message) => void;
  /** Close the currently open thread */
  closeThread: () => void;
  /** Load more thread replies */
  loadMoreThread: () => Promise<void>;
}

export const RoomActionContext = createContext<
  RoomActionContextValue | undefined
>(undefined);

export const RoomActionProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: RoomActionContextValue }>) => (
  <RoomActionContext.Provider value={value}>
    {children}
  </RoomActionContext.Provider>
);

/**
 * Access the RoomActionContext. Must be used within a `<Room>` component.
 */
export const useRoomActionContext = (
  componentName?: string
): RoomActionContextValue => {
  const contextValue = useContext(RoomActionContext);
  if (!contextValue) {
    console.warn(
      `useRoomActionContext was called outside of RoomActionProvider. Make sure this hook is called within a child of the <Room> component.${componentName ? ` Errored in: ${componentName}` : ""}`
    );
    return {} as RoomActionContextValue;
  }
  return contextValue;
};
