import React, { useState, useCallback, useMemo } from "react";
import type { Message } from "../../../types/index";

export interface SearchProps {
  /** Messages to search through */
  messages?: Message[];
  /** Callback when a result is selected */
  onSelectResult?: (message: Message) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional class name */
  className?: string;
}

/**
 * Client-side search component that filters messages.
 *
 * @example
 * ```tsx
 * <Search messages={messages} onSelectResult={msg => jumpTo(msg._id)} />
 * ```
 */
export const Search: React.FC<SearchProps> = ({
  messages = [],
  onSelectResult,
  placeholder = "Search messages...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return messages
      .filter(
        (m) =>
          !m.isDeleted &&
          m.type === "text" &&
          m.text?.toLowerCase().includes(lower)
      )
      .slice(0, 20);
  }, [query, messages]);

  const handleSelect = useCallback(
    (msg: Message) => {
      onSelectResult?.(msg);
      setQuery("");
      setFocused(false);
    },
    [onSelectResult]
  );

  return (
    <div
      className={`hermes-search ${className}`}
      style={{ position: "relative" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          border: "1px solid rgba(128,128,128,0.2)",
          borderRadius: 10,
          background: focused ? "#fff" : "rgba(128,128,128,0.05)",
          transition: "background 0.15s, border-color 0.15s",
          borderColor: focused ? "#0084ff" : "rgba(128,128,128,0.2)",
        }}
      >
        <span style={{ fontSize: 14, opacity: 0.5 }}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 13,
            background: "transparent",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              opacity: 0.5,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {focused && query.trim() && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "#fff",
            border: "1px solid rgba(128,128,128,0.15)",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            maxHeight: 300,
            overflowY: "auto",
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: 16,
                textAlign: "center",
                fontSize: 13,
                opacity: 0.5,
              }}
            >
              No results found
            </div>
          ) : (
            results.map((msg) => (
              <div
                key={msg._id}
                onClick={() => handleSelect(msg)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(128,128,128,0.08)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(0,132,255,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {msg.text}
                </div>
                <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
