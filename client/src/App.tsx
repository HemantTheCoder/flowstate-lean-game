import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
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
import Auth from "@/pages/Auth";
import DevDashboard from "@/pages/DevDashboard";
import Credits from "@/pages/Credits";
import Feedback from "@/pages/Feedback";

function useDismissSplash() {
  useEffect(() => {
    const splash = document.getElementById("splash-screen");
    if (!splash) return;
    // performance.now() is already elapsed-ms-since-navigation-start by spec, so it needs
    // no subtraction - mixing it with Date.now() (epoch ms) as the old code did produced a
    // huge bogus "elapsed" whenever performance.timing was unavailable, making remaining
    // clamp to 0 and the splash dismiss instantly instead of honoring the minimum display time.
    const minDisplayTime = 3000;
    const elapsed = performance.now();
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
  const [location] = useLocation();

  return (
    // Pages are absolutely positioned so that, during the cross-fade, the outgoing and
    // incoming page overlay each other instead of stacking in normal flow (two 100%-height
    // divs in flow made the document briefly twice the viewport height and jumped the layout).
    // The incoming page is later in DOM order, so it also receives the clicks.
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <Switch location={location}>
            <Route path="/" component={Home} />
            <Route path="/chapters" component={ChapterSelect} />
            <Route path="/game" component={Game} />
            <Route path="/debrief" component={Debrief} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/settings" component={Settings} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/profile" component={Profile} />
            <Route path="/auth" component={Auth} />
            <Route path="/dev" component={DevDashboard} />
            <Route path="/credits" component={Credits} />
            <Route path="/feedback" component={Feedback} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </div>
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
