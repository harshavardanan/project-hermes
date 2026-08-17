import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { Message } from "../../../types/index";

export interface SearchProps {
  messages?: Message[];
  /** Server-side search function. When provided, replaces client-side filtering. */
  onSearch?: (query: string) => Promise<Message[]>;
  onSelectResult?: (message: Message) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search component that supports both client-side filtering and server-side search.
 *
 * Pass `onSearch` to use server-side search (recommended). Otherwise pass `messages`
 * for client-side filtering of already-loaded messages.
 */
export const Search: React.FC<SearchProps> = ({
  messages = [],
  onSearch,
  onSelectResult,
  placeholder = "Search messages...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [serverResults, setServerResults] = useState<Message[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!onSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setServerResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await onSearch(query);
        setServerResults(res ?? []);
      } catch {
        setServerResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, onSearch]);

  const clientResults = useMemo(() => {
    if (onSearch || !query.trim()) return [];
    const lower = query.toLowerCase();
    return messages
      .filter(
        (m) =>
          !m.isDeleted &&
          m.type === "text" &&
          m.text?.toLowerCase().includes(lower)
      )
      .slice(0, 20);
  }, [query, messages, onSearch]);

  const results = onSearch ? serverResults : clientResults;

  const handleSelect = useCallback(
    (msg: Message) => {
      onSelectResult?.(msg);
      setQuery("");
      setFocused(false);
    },
    [onSelectResult]
  );

  return (
    <div className={`hermes-search ${className}`} style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          border: "1px solid var(--brand-border, rgba(128,128,128,0.2))",
          borderRadius: 10,
          background: "var(--brand-accent, rgba(128,128,128,0.05))",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: focused ? "0 0 0 2px rgba(255,255,255,0.04)" : "none",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, color: "var(--brand-muted, rgba(128,128,128,0.6))" }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
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
            color: "var(--brand-text, inherit)",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              lineHeight: 1,
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "var(--brand-muted, rgba(128,128,128,0.6))",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {focused && query.trim() && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--brand-card, #1a1a1e)",
            border: "1px solid var(--brand-border, rgba(255,255,255,0.08))",
            borderRadius: 10,
            boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
            maxHeight: 300,
            overflowY: "auto",
            color: "var(--brand-text, inherit)",
          }}
        >
          {searching ? (
            <div
              style={{
                padding: 16,
                textAlign: "center",
                fontSize: 13,
                color: "var(--brand-muted, rgba(128,128,128,0.6))",
              }}
            >
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div
              style={{
                padding: 16,
                textAlign: "center",
                fontSize: 13,
                color: "var(--brand-muted, rgba(128,128,128,0.6))",
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
                  borderBottom: "1px solid var(--brand-border, rgba(128,128,128,0.08))",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--brand-accent, rgba(255,255,255,0.04))")
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
                    color: "var(--brand-text, inherit)",
                  }}
                >
                  {msg.text}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 2,
                    color: "var(--brand-muted, rgba(128,128,128,0.6))",
                  }}
                >
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
