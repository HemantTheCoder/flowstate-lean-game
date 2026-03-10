import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, X, Award, LayoutList, Shield, Package, Truck, CheckCircle2 } from 'lucide-react';

interface ShareableCardData {
  playerName: string;
  mode: 'chapter' | 'certification';
  chapter?: number;
  chapterTitle?: string;
  principle?: string;
  efficiency?: number;
  grade?: string;
  certLevel?: string;
  avgMastery?: number;
  completedChapters?: number;
  chapterMasteries?: Array<{
    chapter: number;
    principle: string;
    mastery: number;
    completed: boolean;
  }>;
}

interface ShareableCardProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareableCardData;
}

const CHAPTER_COLORS = [
  { primary: '#f59e0b', secondary: '#d97706', bg: '#451a03' },
  { primary: '#a855f7', secondary: '#9333ea', bg: '#2e1065' },
  { primary: '#10b981', secondary: '#059669', bg: '#022c22' },
  { primary: '#06b6d4', secondary: '#0891b2', bg: '#083344' },
];

const CERT_COLORS: Record<string, { primary: string; secondary: string }> = {
  Bronze: { primary: '#f97316', secondary: '#ea580c' },
  Silver: { primary: '#94a3b8', secondary: '#64748b' },
  Gold: { primary: '#f59e0b', secondary: '#d97706' },
  Platinum: { primary: '#22d3ee', secondary: '#6366f1' },
  None: { primary: '#64748b', secondary: '#475569' },
};

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function generateChapterCard(canvas: HTMLCanvasElement, data: ShareableCardData) {
  const ctx = canvas.getContext('2d')!;
  const W = 1200;
  const H = 630;
  canvas.width = W;
  canvas.height = H;

  const colors = CHAPTER_COLORS[(data.chapter || 1) - 1];

  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.5, '#1e293b');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  const glowGrad = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, 400);
  glowGrad.addColorStop(0, colors.bg + 'cc');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = colors.primary + '30';
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  for (let i = 0; i < H; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(W, i);
    ctx.stroke();
  }

  drawRoundedRect(ctx, 30, 30, W - 60, H - 60, 24);
  ctx.strokeStyle = colors.primary + '40';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('FLOWSTATE  •  A LEAN CONSTRUCTION STORY', 60, 80);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px system-ui, sans-serif';
  ctx.fillText(`Chapter ${data.chapter} Complete`, 60, 150);

  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(data.principle || '', 60, 195);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText(`"${data.chapterTitle}"`, 60, 235);

  const eff = data.efficiency || 0;
  const circleX = 160;
  const circleY = 400;
  const radius = 90;

  ctx.beginPath();
  ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 12;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(circleX, circleY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * eff / 100));
  const arcGrad = ctx.createLinearGradient(circleX - radius, circleY, circleX + radius, circleY);
  arcGrad.addColorStop(0, colors.primary);
  arcGrad.addColorStop(1, colors.secondary);
  ctx.strokeStyle = arcGrad;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.lineCap = 'butt';

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${eff}%`, circleX, circleY + 10);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('EFFICIENCY', circleX, circleY + 35);
  ctx.textAlign = 'left';

  if (data.grade) {
    const gradeX = 380;
    const gradeY = 340;
    drawRoundedRect(ctx, gradeX, gradeY, 160, 120, 16);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = colors.primary + '40';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.grade, gradeX + 80, gradeY + 70);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('GRADE', gradeX + 80, gradeY + 100);
    ctx.textAlign = 'left';
  }

  const pNameX = 620;
  drawRoundedRect(ctx, pNameX, 300, W - pNameX - 60, 230, 20);
  ctx.fillStyle = '#1e293b80';
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('ENGINEER', pNameX + 30, 340);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px system-ui, sans-serif';
  const displayName = data.playerName.length > 16 ? data.playerName.slice(0, 16) + '…' : data.playerName;
  ctx.fillText(displayName, pNameX + 30, 380);

  ctx.fillStyle = colors.primary;
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(`${data.principle}`, pNameX + 30, 415);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('Completed with ' + (eff >= 80 ? 'Excellence' : eff >= 60 ? 'Competence' : 'Determination'), pNameX + 30, 450);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(today, pNameX + 30, 500);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('flowstate.app', W - 60, H - 45);
  ctx.textAlign = 'left';
}

function generateCertificationCard(canvas: HTMLCanvasElement, data: ShareableCardData) {
  const ctx = canvas.getContext('2d')!;
  const W = 1200;
  const H = 630;
  canvas.width = W;
  canvas.height = H;

  const certColors = CERT_COLORS[data.certLevel || 'None'];

  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(0.5, '#1e293b');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  const glowGrad = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, 500);
  glowGrad.addColorStop(0, certColors.primary + '18');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = certColors.primary + '20';
  ctx.lineWidth = 1;
  for (let i = 0; i < W; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, H);
    ctx.stroke();
  }
  for (let i = 0; i < H; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(W, i);
    ctx.stroke();
  }

  drawRoundedRect(ctx, 30, 30, W - 60, H - 60, 24);
  ctx.strokeStyle = certColors.primary + '40';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, 28, 28, W - 56, H - 56, 26);
  ctx.strokeStyle = certColors.secondary + '20';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('FLOWSTATE  •  LEAN CERTIFICATION', 60, 80);
  ctx.letterSpacing = '0px';

  const badgeX = W / 2;
  const badgeY = 200;
  const badgeR = 70;

  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR + 8, 0, Math.PI * 2);
  ctx.strokeStyle = certColors.primary + '30';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  const badgeGrad = ctx.createLinearGradient(badgeX, badgeY - badgeR, badgeX, badgeY + badgeR);
  badgeGrad.addColorStop(0, certColors.primary + '30');
  badgeGrad.addColorStop(1, certColors.secondary + '20');
  ctx.fillStyle = badgeGrad;
  ctx.fill();
  ctx.strokeStyle = certColors.primary + '60';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = certColors.primary;
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', badgeX, badgeY + 15);

  ctx.fillStyle = certColors.primary;
  ctx.font = 'bold 42px system-ui, sans-serif';
  ctx.fillText(data.certLevel === 'None' ? 'UNRANKED' : (data.certLevel || '').toUpperCase(), badgeX, badgeY + badgeR + 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(data.playerName, badgeX, badgeY + badgeR + 90);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText(`${data.avgMastery || 0}% Average Mastery  •  ${data.completedChapters || 0}/4 Chapters`, badgeX, badgeY + badgeR + 120);

  ctx.textAlign = 'left';

  const masteries = data.chapterMasteries || [];
  const barY = 440;
  const barWidth = (W - 180) / 4;
  const principles = ['Kanban', 'LPS', '5S', 'JIT'];
  const barColors = ['#f59e0b', '#a855f7', '#10b981', '#06b6d4'];

  masteries.forEach((cm, i) => {
    const bx = 60 + i * (barWidth + 20);
    const maxBarH = 100;
    const barH = cm.completed ? (cm.mastery / 100) * maxBarH : 0;

    drawRoundedRect(ctx, bx, barY, barWidth, maxBarH, 8);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    if (cm.completed && barH > 0) {
      const fillY = barY + maxBarH - barH;
      drawRoundedRect(ctx, bx, fillY, barWidth, barH, 8);
      const barGrad = ctx.createLinearGradient(bx, fillY, bx, barY + maxBarH);
      barGrad.addColorStop(0, barColors[i]);
      barGrad.addColorStop(1, barColors[i] + '60');
      ctx.fillStyle = barGrad;
      ctx.fill();
    }

    ctx.fillStyle = cm.completed ? '#ffffff' : '#475569';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(principles[i], bx + barWidth / 2, barY + maxBarH + 25);

    if (cm.completed) {
      ctx.fillStyle = barColors[i];
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(`${cm.mastery}%`, bx + barWidth / 2, barY - 10);
    } else {
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText('--', bx + barWidth / 2, barY - 10);
    }
    ctx.textAlign = 'left';
  });

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(today, W / 2, H - 45);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('flowstate.app', W - 60, H - 45);
  ctx.textAlign = 'left';
}

export default function ShareableCard({ isOpen, onClose, data }: ShareableCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const generateCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (data.mode === 'chapter') {
      generateChapterCard(canvas, data);
    } else {
      generateCertificationCard(canvas, data);
    }
    setGenerated(true);
  }, [data]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    const link = document.createElement('a');
    const suffix = data.mode === 'chapter' ? `ch${data.chapter}` : 'certification';
    link.download = `flowstate-${suffix}-${data.playerName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setTimeout(() => setDownloading(false), 1000);
  }, [data]);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      const file = new File([blob], 'flowstate-results.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'FlowState Results',
          text: data.mode === 'chapter'
            ? `I completed Chapter ${data.chapter} of FlowState with ${data.efficiency}% efficiency!`
            : `I earned ${data.certLevel} certification in FlowState!`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  }, [data, handleDownload]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          data-testid="modal-shareable-card"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                Share Your Results
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                data-testid="button-close-share"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-4">
              <div className="bg-slate-800/50 rounded-xl p-2 mb-4 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg"
                  style={{ aspectRatio: '1200/630' }}
                  data-testid="canvas-share-card"
                />
              </div>

              {!generated ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateCard}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-xl text-white font-bold uppercase tracking-widest text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow"
                  data-testid="button-generate-card"
                >
                  Generate Card
                </motion.button>
              ) : (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-xl text-white font-bold uppercase tracking-widest text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-shadow flex items-center justify-center gap-2 disabled:opacity-50"
                    data-testid="button-download-card"
                  >
                    <Download className="w-4 h-4" />
                    {downloading ? 'Saving...' : 'Download'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="flex-1 py-3 bg-slate-800 border border-slate-700/50 rounded-xl text-white font-bold uppercase tracking-widest text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    data-testid="button-share-card"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
