import React, { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";

export interface TypingContextValue {
  /** Map of userId → displayName for users currently typing */
  typingUsers: Map<string, string>;
  /** Human-readable typing indicator text (e.g. "Alice is typing...") */
  typingText: string | null;
  /** Whether anyone is currently typing */
  isAnyoneTyping: boolean;
  /** Emit a typing start event */
  startTyping: () => void;
  /** Emit a typing stop event */
  stopTyping: () => void;
}

export const TypingContext = createContext<TypingContextValue | undefined>(
  undefined
);

export const TypingProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: TypingContextValue }>) => (
  <TypingContext.Provider value={value}>{children}</TypingContext.Provider>
);

/**
 * Access typing state for the current room. Must be within a `<Room>` component.
 */
export const useTypingContext = (
  componentName?: string
): TypingContextValue => {
  const contextValue = useContext(TypingContext);
  if (!contextValue) {
    console.warn(
      `useTypingContext was called outside of TypingProvider.${componentName ? ` Errored in: ${componentName}` : ""}`
    );
    return {} as TypingContextValue;
  }
  return contextValue;
};
