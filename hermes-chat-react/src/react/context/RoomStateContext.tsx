import React, { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";
import type { Message, Room } from "../../types/index";

export interface RoomStateContextValue {
  /** The Room object for this context */
  room: Room;
  /** Messages in the current room */
  messages: Message[];
  /** Whether messages are initially loading */
  loading: boolean;
  /** Whether older messages are being loaded */
  loadingMore: boolean;
  /** Whether there are more messages to load */
  hasMore: boolean;
  /** Error during message fetching */
  error: string | null;
  /** Members of the room */
  members: string[];
  /** The active thread parent message (null if no thread open) */
  thread: Message | null;
  /** Messages within the active thread */
  threadMessages: Message[];
  /** Whether the thread has more messages to load */
  threadHasMore: boolean;
  /** Whether thread is loading more messages */
  threadLoadingMore: boolean;
  /** Pinned messages in the room */
  pinnedMessages: Message[];
}

export const RoomStateContext = createContext<
  RoomStateContextValue | undefined
>(undefined);

export const RoomStateProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: RoomStateContextValue }>) => (
  <RoomStateContext.Provider value={value}>
    {children}
  </RoomStateContext.Provider>
);

/**
 * Access the RoomStateContext. Must be used within a `<Room>` component.
 */
export const useRoomStateContext = (
  componentName?: string
): RoomStateContextValue => {
  const contextValue = useContext(RoomStateContext);
  if (!contextValue) {
    console.warn(
      `useRoomStateContext was called outside of RoomStateProvider. Make sure this hook is called within a child of the <Room> component.${componentName ? ` Errored in: ${componentName}` : ""}`
    );
    return {} as RoomStateContextValue;
  }
  return contextValue;
};
