import { useState, useEffect, useCallback, useRef } from "react";
import type { HermesClient } from "../../core/HermesClient";
import type { TypingEvent } from "../../types/index";

export const useTyping = (client: HermesClient, roomId: string | null) => {
  
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map(),
  );
  const timeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const typingRef = useRef(false);
  const stopTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const onStart = (event: TypingEvent) => {
      if (event.roomId !== roomId) return;
      if (event.userId === client.currentUser?.userId) return;

      setTypingUsers((prev) =>
        new Map(prev).set(event.userId, event.displayName),
      );

      
      const existing = timeouts.current.get(event.userId);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(event.userId);
          return next;
        });
      }, 4000);
      timeouts.current.set(event.userId, t);
    };

    const onStop = (event: TypingEvent) => {
      if (event.roomId !== roomId) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(event.userId);
        return next;
      });
      const existing = timeouts.current.get(event.userId);
      if (existing) clearTimeout(existing);
      timeouts.current.delete(event.userId);
    };

    client.on("typing:started", onStart);
    client.on("typing:stopped", onStop);

    return () => {
      client.off("typing:started", onStart);
      client.off("typing:stopped", onStop);
      timeouts.current.forEach(clearTimeout);
      timeouts.current.clear();
    };
  }, [roomId, client]);

  
  const startTyping = useCallback(() => {
    if (!roomId) return;

    if (!typingRef.current) {
      client.startTyping(roomId);
      typingRef.current = true;
    }

    
    if (stopTimeout.current) clearTimeout(stopTimeout.current);
    stopTimeout.current = setTimeout(() => {
      client.stopTyping(roomId);
      typingRef.current = false;
    }, 3000);
  }, [roomId, client]);

  
  const stopTyping = useCallback(() => {
    if (!roomId) return;
    if (stopTimeout.current) clearTimeout(stopTimeout.current);
    if (typingRef.current) {
      client.stopTyping(roomId);
      typingRef.current = false;
    }
  }, [roomId, client]);

  
  const typingText = (() => {
    const names = Array.from(typingUsers.values());
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names[0]} and ${names.length - 1} others are typing...`;
  })();

  return {
    typingUsers, 
    typingText, 
    isAnyoneTyping: typingUsers.size > 0,
    startTyping,
    stopTyping,
  };
};
