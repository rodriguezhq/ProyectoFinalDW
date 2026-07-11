import React from 'react';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base ">
      <AppRoutes />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default App;
