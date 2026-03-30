import React, { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";
import type { Message, DeliveryStatus } from "../../types/index";

export type GroupStyle = "top" | "middle" | "bottom" | "single";

export interface MessageContextValue {
  /** The message object */
  message: Message;
  /** Whether actions (edit, delete, flag, etc.) are enabled */
  actionsEnabled: boolean;
  /** Whether this message belongs to the current user */
  isMyMessage: boolean;
  /** Handle editing the message */
  handleEdit: (text: string) => Promise<void>;
  /** Handle deleting the message */
  handleDelete: () => Promise<void>;
  /** Handle adding a reaction */
  handleReaction: (emoji: string) => Promise<void>;
  /** Handle replying (inline quote) */
  handleReply: () => void;
  /** Handle opening a thread */
  handleOpenThread: () => void;
  /** Message delivery status */
  deliveryStatus: DeliveryStatus;
  /** Users who have seen this message */
  readBy: string[];
  /** Group style for visual grouping of consecutive messages from the same sender */
  groupStyle: GroupStyle;
  /** Whether this message is highlighted (e.g. jump-to-message) */
  highlighted?: boolean;
  /** Whether this message is in a thread list */
  threadList?: boolean;
  /** Custom date formatter */
  formatDate?: (date: Date) => string;
}

export const MessageContext = createContext<MessageContextValue | undefined>(
  undefined
);

export const MessageProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: MessageContextValue }>) => (
  <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
);

/**
 * Access the MessageContext. Must be used within a `<Message>` component.
 */
export const useMessageContext = (
  componentName?: string
): MessageContextValue => {
  const contextValue = useContext(MessageContext);
  if (!contextValue) {
    console.warn(
      `useMessageContext was called outside of MessageProvider.${componentName ? ` Errored in: ${componentName}` : ""}`
    );
    return {} as MessageContextValue;
  }
  return contextValue;
};
