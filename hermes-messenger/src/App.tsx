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
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 animate-pulse">Initializing Messenger...</p>
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
