import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
// import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Game from "@/pages/Game";
import Settings from "@/pages/Settings";
import Debrief from "@/pages/Debrief";
import Dashboard from "@/pages/Dashboard";

import ChapterSelect from "@/pages/ChapterSelect";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import DevDashboard from "@/pages/DevDashboard";
import Credits from "@/pages/Credits";
import Feedback from "@/pages/Feedback";

function useDismissSplash() {
  useEffect(() => {
    const splash = document.getElementById("splash-screen");
    if (!splash) return;
    const minDisplayTime = 3000; // Increased to 3 seconds for better readability
    const startTime = performance.timing?.navigationStart || performance.now();
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDisplayTime - elapsed);

    const timer = setTimeout(() => {
      splash.style.opacity = "0";
      splash.style.visibility = "hidden";
      setTimeout(() => splash.remove(), 600);
    }, remaining);
    return () => clearTimeout(timer);
  }, []);
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chapters" component={ChapterSelect} />
      <Route path="/game" component={Game} />
      <Route path="/debrief" component={Debrief} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/dev" component={DevDashboard} />
      <Route path="/credits" component={Credits} />
      <Route path="/feedback" component={Feedback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useDismissSplash();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
      {/* <Analytics /> */}
    </QueryClientProvider>
  );
}

export default App;
