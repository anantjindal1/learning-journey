"use client";

/**
 * Wraps app with AuthProvider and conditionally shows Navbar when authenticated.
 */

import { AuthProvider } from "@/lib/AuthContext";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
    </AuthProvider>
  );
}
