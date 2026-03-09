import { exportChapterReport } from './client/src/lib/exportPDF';

const sampleData = {
    playerName: "HemantTheCoder",
    chapter: 4,
    chapterTitle: "Pull Systems & JIT",
    dailyMetrics: Array.from({ length: 28 }, (_, i) => ({
        day: i + 1,
        efficiency: Math.min(100, 70 + i),
        tasksCompletedToday: Math.floor(Math.random() * 5) + 1,
        potentialCapacity: 5,
        cumulativeEfficiency: 80,
        insight: "The team maintained a steady pace. Keep monitoring WIP limits and pull material just in time."
    })),
    finalEfficiency: 85,
    ppc: 90,
    quizScore: 4,
    quizTotal: 5,
    keyDecisions: [
        { label: "Used Heijunka Box to level workload", outcome: "good" as const },
        { label: "Ignored the material constraint on Day 5 causing delays", outcome: "bad" as const },
        { label: "Adjusted Takt Time to meet client deadline smoothly", outcome: "good" as const },
        { label: "Failed to implement safety buffer for drywall", outcome: "bad" as const }
    ],
    keyLearnings: [
        "Pull systems reduce inventory waste.",
        "Takt time is the heartbeat of the project.",
        "Heijunka levels out variations in demand.",
        "Always identify constraints before making promises."
    ],
    badges: ["Flow Master", "Takt Master", "JIT Strategist"]
};

if (typeof window === 'undefined') {
    (global as any).window = global;
    (global as any).document = { createElement: () => ({}) };
    (global as any).navigator = { userAgent: 'node' };
}

try {
    exportChapterReport(sampleData);
    console.log("PDF generated successfully. Check the current directory for FLOWSTATE_Chapter4_Report.pdf");
} catch (e) {
    console.error("Error generating PDF:", e);
}
