import jsPDF from 'jspdf';

interface ChapterReportData {
  playerName: string;
  chapter: number;
  chapterTitle: string;
  dailyMetrics: {
    day: number;
    efficiency: number;
    tasksCompletedToday: number;
    potentialCapacity: number;
    cumulativeEfficiency: number;
    insight: string;
  }[];
  finalEfficiency: number;
  ppc?: number;
  quizScore?: number;
  quizTotal?: number;
  keyDecisions?: { label: string; outcome: 'good' | 'bad' }[];
  keyLearnings: string[];
  badges?: string[];
}

export function exportChapterReport(data: ChapterReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FLOWSTATE', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Performance Report', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Player: ${data.playerName}`, 15, y);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 50, y);
  y += 5;
  doc.text(`Chapter ${data.chapter}: ${data.chapterTitle}`, 15, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Summary', 15, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Final Efficiency: ${data.finalEfficiency}%`, 20, y);
  y += 5;
  if (data.ppc !== undefined) {
    doc.text(`PPC: ${data.ppc}%`, 20, y);
    y += 5;
  }
  if (data.quizScore !== undefined && data.quizTotal !== undefined) {
    doc.text(`Quiz: ${data.quizScore} / ${data.quizTotal}`, 20, y);
    y += 5;
  }
  y += 3;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Day-by-Day Breakdown', 15, y);
  y += 6;

  // Table Headers
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 245, 245);
  doc.rect(15, y - 4, pageWidth - 30, 6, 'F');

  const colX = {
    day: 17,
    tasks: 28,
    capacity: 45,
    dailyEff: 65,
    cumulEff: 85,
    insight: 105
  };

  doc.text('Day', colX.day, y);
  doc.text('Tasks', colX.tasks, y);
  doc.text('Capacity', colX.capacity, y);
  doc.text('Daily Eff.', colX.dailyEff, y);
  doc.text('Cumul.', colX.cumulEff, y);
  doc.text('Insight', colX.insight, y);
  y += 6;

  // Table Content
  doc.setFont('helvetica', 'normal');
  data.dailyMetrics.forEach(m => {
    if (y > pageHeight - 15) {
      doc.addPage();
      y = 15;
    }
    doc.text(`${m.day}`, colX.day, y);
    doc.text(`${m.tasksCompletedToday}`, colX.tasks, y);
    doc.text(`${m.potentialCapacity}`, colX.capacity, y);
    doc.text(`${m.efficiency}%`, colX.dailyEff, y);
    doc.text(`${m.cumulativeEfficiency}%`, colX.cumulEff, y);

    const insightLines = doc.splitTextToSize(m.insight, pageWidth - colX.insight - 15);
    doc.text(insightLines, colX.insight, y);

    const rowHeight = Math.max(5, insightLines.length * 4);
    y += rowHeight;
  });
  y += 4;

  if (data.keyDecisions && data.keyDecisions.length > 0) {
    if (y > pageHeight - 25) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Decisions', 15, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data.keyDecisions.forEach(d => {
      const marker = d.outcome === 'good' ? '[+]' : '[-]';
      const lines = doc.splitTextToSize(`${marker} ${d.label}`, pageWidth - 35);
      if (y + (lines.length * 4) > pageHeight - 15) { doc.addPage(); y = 15; }
      doc.text(lines, 20, y);
      y += lines.length * 4 + 1;
    });
    y += 4;
  }

  if (y > pageHeight - 25) { doc.addPage(); y = 15; }
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Learnings', 15, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  data.keyLearnings.forEach(lesson => {
    const lines = doc.splitTextToSize(`- ${lesson}`, pageWidth - 35);
    if (y + (lines.length * 4) > pageHeight - 15) { doc.addPage(); y = 15; }
    doc.text(lines, 20, y);
    y += lines.length * 4 + 1;
  });
  y += 4;

  if (data.badges && data.badges.length > 0) {
    if (y > pageHeight - 25) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Badges Earned', 15, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const badgeLines = doc.splitTextToSize(data.badges.join(', '), pageWidth - 35);
    if (y + (badgeLines.length * 4) > pageHeight - 15) { doc.addPage(); y = 15; }
    doc.text(badgeLines, 20, y);
    y += badgeLines.length * 4 + 4;
  }

  // Footer & Page Numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 25, pageHeight - 8);
    doc.text('Generated by FLOWSTATE - Saga of the Flow Architect', pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  doc.save(`FLOWSTATE_Chapter${data.chapter}_Report.pdf`);
}
