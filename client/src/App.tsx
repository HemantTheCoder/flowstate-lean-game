import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
// import { Analytics } from "@vercel/analytics/react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Game from "@/pages/Game";
import Settings from "@/pages/Settings";
import Debrief from "@/pages/Debrief";
import Dashboard from "@/pages/Dashboard";

import ChapterSelect from "@/pages/ChapterSelect";
import Leaderboard from "@/pages/Leaderboard";
import DevDashboard from "@/pages/DevDashboard";
import Credits from "@/pages/Credits";

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
      <Route path="/dev" component={DevDashboard} />
      <Route path="/credits" component={Credits} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      {/* <Analytics /> */}
    </QueryClientProvider>
  );
}

export default App;
