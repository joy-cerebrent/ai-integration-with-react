import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from "@/context/AuthContext.tsx";
import { ThemeProvider } from "@/context/ThemeProvider.tsx";
// import { SocketProvider } from "@/context/SocketProvider.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";

import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>        
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <App />
            <Toaster position="top-center" />
          </ThemeProvider>
        </QueryClientProvider>        
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);