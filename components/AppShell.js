"use client";

import { useApp } from "@/context/AppContext";
import Home from "@/components/Home/Home";
import InfoForm from "@/components/InfoForm/InfoForm";
import GenerationQueue from "@/components/GenerationQueue/GenerationQueue";
import ShootDetail from "@/components/ShootDetail/ShootDetail";
import Dashboard from "@/components/Dashboard/Dashboard";
import ToastHost from "@/components/Toast/ToastHost";

export default function AppShell() {
  const { screen } = useApp();

  return (
    <>
      {screen === "home" && <Home />}
      {screen === "info" && <InfoForm />}
      {screen === "queue" && <GenerationQueue />}
      {screen === "detail" && <ShootDetail />}
      {screen === "dashboard" && <Dashboard />}
      <ToastHost />
    </>
  );
}
