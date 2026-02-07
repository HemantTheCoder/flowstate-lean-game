import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, BarChart3, Target, Users,
  ArrowLeft, Activity, Zap, GitBranch, Clock
} from 'lucide-react';

function getColor(value: number, thresholds: [number, number] = [50, 75]) {
  if (value >= thresholds[1]) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  if (value >= thresholds[0]) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
}

function getEfficiencyBarColor(value: number) {
  if (value >= 80) return 'bg-green-500';
  if (value >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4 }
  })
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { dailyMetrics, lpi, ppcHistory, flags, log } = useGameStore();

  if (dailyMetrics.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Activity className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-700 mb-3">No data yet</h2>
          <p className="text-slate-500 mb-8">
            No data yet. Complete a chapter to see your performance metrics.
          </p>
          <button
            data-testid="button-go-chapters"
            onClick={() => navigate('/chapters')}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
          >
            Go to Chapters
          </button>
        </motion.div>
      </div>
    );
  }

  const summaryCards = [
    { label: 'Flow Efficiency', value: lpi.flowEfficiency, icon: TrendingUp, suffix: '%' },
    { label: 'PPC', value: lpi.ppc, icon: Target, suffix: '%' },
    { label: 'Team Morale', value: lpi.teamMorale, icon: Users, suffix: '%' },
    { label: 'Waste Removed', value: lpi.wasteRemoved, icon: Zap, suffix: '' },
  ];

  const chartData = dailyMetrics.map(m => ({
    name: `Day ${m.day}`,
    daily: m.efficiency,
    cumulative: m.cumulativeEfficiency,
  }));

  const ppcData = ppcHistory.map(p => ({
    name: `Week ${p.week}`,
    ppc: p.ppc,
  }));

  const pushed = !!flags['pushed_day4'] || !!flags['decision_push_made'];

  const decisions: { label: string; positive: boolean }[] = [];
  if ('pushed_day4' in flags || 'decision_push_made' in flags) {
    decisions.push(
      pushed
        ? { label: 'Day 4: Chose Push System', positive: false }
        : { label: 'Day 4: Chose Pull System', positive: true }
    );
  }

  const recentLogs = log.slice(-10);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          data-testid="button-back-home"
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Performance Dashboard</h1>
          <p className="text-xs text-slate-500">FLOWSTATE Construction Metrics</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryCards.map((card, i) => {
            const colors = getColor(card.value);
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                data-testid={`card-metric-${i}`}
                className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                  <span className="text-xs font-medium text-slate-500">{card.label}</span>
                </div>
                <div className={`text-3xl font-black ${colors.text}`}>
                  {card.value}{card.suffix}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-slate-200 p-4 md:p-6"
        >
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Efficiency Trend
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="daily"
                  name="Daily Efficiency"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative Efficiency"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.08}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {ppcData.length > 0 && (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl border border-slate-200 p-4 md:p-6"
          >
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              PPC Trend (Percent Plan Complete)
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ppcData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ppc"
                    name="PPC %"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        )}

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-slate-200 p-4 md:p-6"
        >
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Day-by-Day Breakdown
          </h2>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm" data-testid="table-daily-breakdown">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-3 py-2">Day</th>
                  <th className="px-3 py-2">Tasks Done</th>
                  <th className="px-3 py-2">Capacity</th>
                  <th className="px-3 py-2">Daily Eff.</th>
                  <th className="px-3 py-2">Cumulative</th>
                  <th className="px-3 py-2 min-w-[200px]">Insight</th>
                </tr>
              </thead>
              <tbody>
                {dailyMetrics.map((m, idx) => (
                  <tr
                    key={m.day}
                    data-testid={`row-day-${m.day}`}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                  >
                    <td className="px-3 py-2.5 font-bold text-slate-700">Day {m.day}</td>
                    <td className="px-3 py-2.5 text-slate-600">{m.tasksCompletedToday}</td>
                    <td className="px-3 py-2.5 text-slate-600">{m.potentialCapacity}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getEfficiencyBarColor(m.efficiency)}`}
                            style={{ width: `${m.efficiency}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{m.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-semibold text-slate-600">{m.cumulativeEfficiency}%</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{m.insight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl border border-slate-200 p-4 md:p-6"
        >
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-500" />
            Decision History
          </h2>

          {decisions.length > 0 && (
            <div className="space-y-2 mb-4">
              {decisions.map((d, i) => (
                <div
                  key={i}
                  data-testid={`decision-${i}`}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    d.positive
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {d.label}
                </div>
              ))}
            </div>
          )}

          {decisions.length === 0 && (
            <p className="text-sm text-slate-400 mb-4">No key decisions recorded yet.</p>
          )}

          {recentLogs.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Recent Events
              </h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {recentLogs.map((entry, i) => (
                  <div
                    key={i}
                    data-testid={`log-entry-${i}`}
                    className="text-xs text-slate-500 py-1 px-2 rounded bg-slate-50"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
