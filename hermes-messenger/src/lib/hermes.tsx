import React, { createContext, useContext, useEffect, useState } from "react";
import { HermesClient, HermesUser, HermesConfig } from "hermes-chat-react";
import { useAuthStore } from "../store/authStore";

interface HermesContextType {
  client: HermesClient | null;
  user: HermesUser | null;
  status: string;
}

const HermesContext = createContext<HermesContextType>({
  client: null,
  user: null,
  status: "idle",
});

export const useHermes = () => useContext(HermesContext);

export const HermesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: firebaseUser } = useAuthStore();
  const [client, setClient] = useState<HermesClient | null>(null);
  const [hermesUser, setHermesUser] = useState<HermesUser | null>(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (firebaseUser) {
      const endpoint = import.meta.env.VITE_HERMES_ENDPOINT || "";
      const apiKey = import.meta.env.VITE_HERMES_API_KEY || "";
      const secret = import.meta.env.VITE_HERMES_SECRET || "";

      if (!endpoint || !apiKey || !secret) {
        console.error("Hermes configuration missing in .env");
        setStatus("error");
        return;
      }

      setStatus("connecting");

      try {
        const config: HermesConfig = {
          endpoint,
          apiKey,
          secret,
          userId: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          avatar: firebaseUser.photoURL
        };

        const hClient = new HermesClient(config);
        setClient(hClient);

        hClient.connect()
          .then((user) => {
            setHermesUser(user);
            setStatus("connected");
          })
          .catch((err) => {
            console.error("Hermes connection failed:", err);
            setStatus("error");
          });

        return () => {
          hClient.disconnect();
        };
      } catch (err) {
        console.error("Hermes initialization error:", err);
        setStatus("error");
      }
    } else {
      setClient(null);
      setHermesUser(null);
      setStatus("idle");
    }
  }, [firebaseUser]);

  return (
    <HermesContext.Provider value={{ client, user: hermesUser, status }}>
      {children}
    </HermesContext.Provider>
  );
};
