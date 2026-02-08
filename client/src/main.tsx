import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { apiRequest, queryClient } from "./lib/queryClient";

// Developer Tools
(window as any).dev_clearLeaderboard = async () => {
    if (!confirm("⚠️ ARE YOU SURE? This will wipe the entire leaderboard.")) return;
    try {
        await apiRequest('DELETE', '/api/leaderboard');
        await queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] }); // Force UI refresh
        console.log("✅ Leaderboard cleared successfully!");
        alert("Leaderboard cleared.");
    } catch (e) {
        console.error("Failed to clear leaderboard:", e);
        alert("Failed to clear leaderboard. Check console.");
    }
};

console.log(
    "%c 🛠️ Developer Tools Loaded: Type %cwindow.dev_clearLeaderboard()%c to wipe scores.",
    "color: #888", "color: #ff00ff; font-weight: bold;", "color: #888"
);

createRoot(document.getElementById("root")!).render(<App />);
