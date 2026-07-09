import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary, { DamagedFileCard } from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";
import Gauntlet from "./pages/Gauntlet";
import Round from "./pages/Round";
import Debrief from "./pages/Debrief";
import Profile from "./pages/Profile";
import Codex from "./pages/Codex";
import Play from "./pages/Play";
import Institutions from "./pages/Institutions";
import Architecture from "./pages/Architecture";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    // Data routers swallow render errors and show their own default screen;
    // route them to the same case-file card as the top-level boundary.
    errorElement: <DamagedFileCard />,
    children: [
      { path: "/", element: <Welcome /> },
      { path: "/play", element: <Play /> },
      { path: "/gauntlet", element: <Gauntlet /> },
      { path: "/round/:scenarioId", element: <Round /> },
      { path: "/debrief/:sessionId", element: <Debrief /> },
      { path: "/profile", element: <Profile /> },
      { path: "/codex", element: <Codex /> },
      { path: "/for-institutions", element: <Institutions /> },
      { path: "/architecture", element: <Architecture /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
