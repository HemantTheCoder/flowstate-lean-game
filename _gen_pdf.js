const { jsPDF } = require("jspdf");
const fs = require("fs");

const doc = new jsPDF({ unit: "mm", format: "a4" });
const pageW = 210;
const marginL = 18;
const marginR = 18;
const contentW = pageW - marginL - marginR;
let y = 20;

const colors = {
  title: [15, 23, 42],
  heading: [30, 64, 175],
  subheading: [51, 65, 85],
  body: [51, 65, 85],
  accent: [6, 182, 212],
  muted: [100, 116, 139],
};

function checkPage(needed = 14) {
  if (y + needed > 278) {
    doc.addPage();
    y = 20;
  }
}

function drawLine() {
  doc.setDrawColor(...colors.muted);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, pageW - marginR, y);
  y += 4;
}

function writeTitle(text) {
  checkPage(16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...colors.title);
  doc.text(text, pageW / 2, y, { align: "center" });
  y += 10;
}

function writeSubtitle(text) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...colors.accent);
  doc.text(text, pageW / 2, y, { align: "center" });
  y += 8;
}

function writeH2(text) {
  checkPage(14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...colors.heading);
  doc.text(text, marginL, y);
  y += 7;
}

function writeH3(text) {
  checkPage(12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...colors.subheading);
  doc.text(text, marginL, y);
  y += 6;
}

function writeLabel(label, value) {
  checkPage(8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...colors.heading);
  doc.text(label, marginL, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.body);
  const labelW = doc.getTextWidth(label + " ");
  const lines = doc.splitTextToSize(value, contentW - labelW);
  doc.text(lines[0], marginL + labelW, y);
  if (lines.length > 1) {
    for (let i = 1; i < lines.length; i++) {
      y += 4.5;
      checkPage(6);
      doc.text(lines[i], marginL, y);
    }
  }
  y += 5.5;
}

function writePara(text, indent = 0) {
  checkPage(8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.body);
  const lines = doc.splitTextToSize(text, contentW - indent);
  for (const line of lines) {
    checkPage(5);
    doc.text(line, marginL + indent, y);
    y += 4.5;
  }
  y += 1.5;
}

function writeBullet(text) {
  checkPage(6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...colors.accent);
  doc.text("\u2022", marginL + 2, y);
  doc.setTextColor(...colors.body);
  const lines = doc.splitTextToSize(text, contentW - 8);
  for (let i = 0; i < lines.length; i++) {
    checkPage(5);
    doc.text(lines[i], marginL + 7, y);
    y += 4.5;
  }
}

// === PAGE 1 ===

// Title block
doc.setFillColor(15, 23, 42);
doc.rect(0, 0, pageW, 48, "F");
doc.setFont("helvetica", "bold");
doc.setFontSize(28);
doc.setTextColor(255, 255, 255);
doc.text("FLOWSTATE", pageW / 2, 22, { align: "center" });
doc.setFont("helvetica", "normal");
doc.setFontSize(12);
doc.setTextColor(6, 182, 212);
doc.text("A Lean Construction Learning Game", pageW / 2, 32, { align: "center" });
doc.setFontSize(9);
doc.setTextColor(148, 163, 184);
doc.text("Master the Flow. Eliminate the Waste.", pageW / 2, 40, { align: "center" });

y = 56;

// Overview
writeH2("Overview");
writePara("FlowState is a browser-based educational game that teaches Lean Construction principles through an interactive visual novel narrative. Players take on the role of a junior Lean Architect assigned to guide construction teams through increasingly complex projects, learning four core Lean methodologies \u2014 Kanban, Last Planner System (LPS), 5S, and Pull/Just-In-Time (JIT) \u2014 by making real management decisions and seeing their consequences unfold in real time.");
writePara("The game combines story-driven dialogue with hands-on simulation mechanics. Each chapter introduces a distinct Lean principle through a unique gameplay system, ensuring that players don't just read about Lean \u2014 they practice it.");

drawLine();

// How it teaches
writeH2("How FlowState Teaches");
writePara('FlowState uses a "learn by doing" pedagogical approach structured around four pillars:');
writeBullet("Narrative Context: Each chapter is set in a realistic construction scenario with recurring characters (Mira the Project Manager, Rao the Traditional Foreman, Isha the Junior Planner) who debate Lean vs. traditional thinking through dialogue, creating memorable context for each principle.");
writeBullet("Interactive Simulation: Each chapter features a unique gameplay system \u2014 a Kanban board, a planning room, a depot organizer, or a logistics dashboard \u2014 that directly models the Lean tool being taught. Players make choices with real in-game consequences.");
writeBullet("Dynamic Events & Consequences: Daily disruptions (monsoon rain, supply delays, client pressure, truck breakdowns) force players to apply Lean principles under stress. Wrong decisions produce immediate negative feedback.");
writeBullet("Reflective Feedback: End-of-chapter summaries include animated metrics, letter grades (S/A/B/C/D), chart breakdowns, key learnings, earned badges, and exportable PDF performance reports.");

drawLine();

// Chapter Breakdown
writeH2("Chapter Breakdown");
y += 1;

// Ch1
writeH3("Chapter 1: Kanban \u2014 \"The Jam at Juniper Pier\" (Days 1\u20135)");
writeLabel("Teaches:", "Work-In-Progress (WIP) limits, flow-based task management, Pull vs. Push thinking, resource starvation recovery.");
writePara("Players manage a four-column Kanban board (Backlog \u2192 Ready \u2192 Doing \u2192 Done), dragging construction tasks through the workflow while managing a WIP limit slider. Overloading the Doing column triggers congestion warnings and morale penalties. Players balance funds ($2,500 budget, $250/day overhead) and materials while navigating daily events \u2014 supply delays force prioritizing zero-cost prep tasks, monsoons block outdoor work, and the foreman pressures the player to \"Push\" tasks for an inspector, testing Pull vs. Push decision-making.");
writeLabel("Key Outcomes:", "Limiting active work increases throughput; adapting plans to handle variation; Push creates waste while Pull creates value.");
y += 1;

// Ch2
writeH3("Chapter 2: Last Planner System \u2014 \"The Riverside Market Mall\" (Days 6\u201311)");
writeLabel("Teaches:", "Constraint analysis, reliable promising (Should \u2192 Can \u2192 Will), Percent Plan Complete (PPC), reasons analysis.");
writePara("A dedicated Planning Room replaces the Kanban view. Players follow the LPS workflow: pulling tasks into a Lookahead window (Should), identifying and removing constraints \u2014 Material, Crew, Approval, Weather blockers \u2014 by spending funds or morale (Can), and committing only constraint-free tasks to the Weekly Work Plan (Will). Surprise complications add new constraints mid-week. Client pressure forces a choice between reliability and speed. PPC is the primary metric, reinforced through a Reasons Analysis debrief.");
writeLabel("Key Outcomes:", "100% completion of a small plan beats 40% of an overcommitted one; proactive blocker identification; trust through reliable commitments.");
y += 1;

// Ch3
writeH3("Chapter 3: 5S Methodology \u2014 \"The Tangled Depot\" (Days 12\u201316)");
writeLabel("Teaches:", "Sort (Seiri), Set in Order (Seiton), Shine (Seiso), Standardize (Seiketsu), Sustain (Shitsuke).");
writePara("A Workspace Depot grid replaces the Kanban board. Players drag items (tools, materials, waste) into designated zones: Tool Shadow Board, Material Storage, and Red Tag Area. The 5S steps are enforced chronologically: Sort (Day 12) allows only waste removal; Set in Order (Day 13) unlocks tool/material placement; Shine (Day 14) introduces clickable hazards. Standardize (Day 15) tests all steps when a new delivery arrives. Sustain (Day 16) is the final audit. A live 5S Grade updates in real time, visualized in a radar chart.");
writeLabel("Key Outcomes:", "Clutter slows work and creates hazards; anyone should find any tool in 30 seconds; Sustain is the hardest step.");
y += 1;

// Ch4
writeH3("Chapter 4: Pull/JIT \u2014 \"Midfield Terminal\" (Days 1\u201312)");
writeLabel("Teaches:", "Pull-based material flow, Just-In-Time delivery, the Bullwhip Effect, demand smoothing, safety buffers, takt time.");
writePara("A three-panel logistics dashboard introduces supply chain management. The Pull Board sets WIP limits per trade (Carpentry, Finishing, Electrical). The JIT Scheduler orders materials with lead times, expediting options (1.5x cost), and safety buffer levels. A Site Map Overlay shows three airport zones with strict storage capacities \u2014 overcapacity triggers penalties. Day 3 simulates the Bullwhip Effect; Day 4 tests safety buffers with a truck breakdown.");
writeLabel("Key Outcomes:", "Match deliveries to demand, not forecasts; smaller frequent deliveries improve flow; balance protection vs. excess inventory waste.");

drawLine();

// Features
writeH2("Unique Features");
const features = [
  ["Visual Novel Narrative", "Story-driven learning with recurring characters embodying Lean vs. traditional thinking through animated dialogue"],
  ["Four Unique Gameplay Systems", "Kanban Board, Planning Room, Depot Organizer, and Logistics Dashboard \u2014 each chapter uses a distinct mechanic"],
  ["Real-Time Performance Metrics", "Animated counters track Flow Efficiency, PPC, Team Morale, WIP Compliance, and Bullwhip Index"],
  ["Performance Grading & Badges", "Letter grades (S\u2013D) with animated effects, plus achievement badges (Flow Master, Promise Keeper, 5S Auditor, JIT Strategist)"],
  ["Exportable PDF Reports", "Detailed performance reports with day-by-day breakdowns, key decisions, and chapter-specific learnings"],
  ["Global Leaderboard", "Competitive ranking tracking total score, efficiency, and PPC across all players"],
  ["Progressive Web App", "Installable on mobile/desktop with offline support for learning anywhere"],
  ["Knowledge Check Quizzes", "End-of-chapter quizzes testing core principles, with scores factored into final grades"],
];
for (const [feat, desc] of features) {
  writeBullet(`${feat}: ${desc}`);
}

drawLine();

writeH2("Technical Stack");
writePara("Built with React, TypeScript, Express.js, PostgreSQL, Phaser 3, Zustand, Tailwind CSS, and Framer Motion. Runs as a full-stack web app with PWA capabilities and procedurally generated sound effects via the Web Audio API.");

y += 3;
checkPage(10);
doc.setFont("helvetica", "italic");
doc.setFontSize(9);
doc.setTextColor(...colors.muted);
const closing = doc.splitTextToSize("FlowState transforms Lean Construction education from passive reading into active decision-making, letting players experience firsthand why WIP limits prevent congestion, why reliable promises build trust, why organized workspaces save time, and why pulling materials to demand eliminates waste.", contentW);
for (const line of closing) {
  checkPage(5);
  doc.text(line, pageW / 2, y, { align: "center" });
  y += 4.5;
}

// Footer on each page
const totalPages = doc.internal.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`FlowState \u2014 Lean Construction Learning Game`, marginL, 290);
  doc.text(`Page ${i} of ${totalPages}`, pageW - marginR, 290, { align: "right" });
}

const outPath = "/home/runner/workspace/FlowState_Report.pdf";
const buffer = doc.output("arraybuffer");
fs.writeFileSync(outPath, Buffer.from(buffer));
console.log("PDF saved to", outPath, "- Size:", fs.statSync(outPath).size, "bytes");
