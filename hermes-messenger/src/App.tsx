import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { Login } from './components/Login';
import { Messenger } from './components/Messenger';
import { HermesProvider } from './lib/hermes';

function App() {
  const { user, loading, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center" style={{ background: "var(--brand-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p style={{ color: "var(--brand-muted)" }} className="animate-pulse text-sm">Initializing Messenger...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <HermesProvider>
      <Messenger />
    </HermesProvider>
  );
}

export default App;
