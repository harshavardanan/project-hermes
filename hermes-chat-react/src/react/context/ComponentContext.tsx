import React, { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";

/**
 * ComponentContext allows developers to override any internal UI component
 * with their own implementation. This is the Inversion of Control (IoC) pattern
 * used by Stream Chat React.
 *
 * Usage:
 * ```tsx
 * <Room roomId={id} Avatar={MyCustomAvatar} Message={MyCustomMessage}>
 *   <MessageList />
 * </Room>
 * ```
 */
export interface ComponentContextValue {
  /** Custom Avatar component */
  Avatar?: React.ComponentType<any>;
  /** Custom Message bubble component */
  Message?: React.ComponentType<any>;
  /** Custom MessageStatus component (delivery indicators) */
  MessageStatus?: React.ComponentType<any>;
  /** Custom MessageActions component (hover toolbar) */
  MessageActions?: React.ComponentType<any>;
  /** Custom DateSeparator component */
  DateSeparator?: React.ComponentType<any>;
  /** Custom EmptyStateIndicator component */
  EmptyStateIndicator?: React.ComponentType<any>;
  /** Custom LoadingIndicator component */
  LoadingIndicator?: React.ComponentType<any>;
  /** Custom LoadingErrorIndicator component */
  LoadingErrorIndicator?: React.ComponentType<any>;
  /** Custom ReactionPicker component */
  ReactionPicker?: React.ComponentType<any>;
  /** Custom TypingIndicator component */
  TypingIndicator?: React.ComponentType<any>;
  /** Custom MediaMessage (attachment renderer) component */
  MediaMessage?: React.ComponentType<any>;
  /** Custom ThreadHeader component */
  ThreadHeader?: React.ComponentType<any>;
  /** Custom Modal component */
  Modal?: React.ComponentType<any>;
  /** Custom ChatInput component */
  ChatInput?: React.ComponentType<any>;
  /** Custom RoomListItem component */
  RoomListItem?: React.ComponentType<any>;
  /** Custom Search component */
  Search?: React.ComponentType<any>;
  /** Custom OnlineBadge component */
  OnlineBadge?: React.ComponentType<any>;
}

export const ComponentContext = createContext<ComponentContextValue>({});

export const ComponentProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: Partial<ComponentContextValue> }>) => (
  <ComponentContext.Provider value={value as ComponentContextValue}>
    {children}
  </ComponentContext.Provider>
);

/**
 * Access component overrides. Returns an empty object if no overrides are set.
 */
export const useComponentContext = (
  _componentName?: string
): ComponentContextValue => useContext(ComponentContext);
