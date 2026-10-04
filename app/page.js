"use client";

import { AppProvider } from "@/context/AppContext";
import AppShell from "@/components/AppShell";

export default function Page() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
