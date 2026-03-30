import React from "react";
import type { PropsWithChildren } from "react";
import { useChatContext } from "../../context/ChatContext";

export interface WindowProps {
  /** Additional class name */
  className?: string;
}

/**
 * Layout wrapper for the message area. Renders a flex-column container
 * that holds `<MessageList />` and `<ChatInput />`.
 *
 * @example
 * ```tsx
 * <Window>
 *   <MessageList />
 *   <ChatInput />
 * </Window>
 * ```
 */
export const Window = ({
  className = "",
  children,
}: PropsWithChildren<WindowProps>) => {
  const { customClasses } = useChatContext("Window");

  const containerClass =
    customClasses?.window || `hermes-window ${className}`.trim();

  return (
    <div
      className={containerClass}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};
