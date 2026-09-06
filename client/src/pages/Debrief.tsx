import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

/** One concrete thing the player can try at work, per chapter. The point of the whole exercise
 *  is transfer: a principle they can name but not apply on Monday hasn't landed. */
const REAL_WORLD_ACTIONS: Record<number, { principle: string; action: string; watchFor: string }[]> = {
  1: [
    {
      principle: 'Limit work in progress',
      action: 'Count how many jobs your team currently has open at once. Pick a number you can actually finish, and start nothing new until something closes.',
      watchFor: 'Things finishing sooner even though you started fewer of them.'
    },
    {
      principle: 'Measure finishing, not starting',
      action: 'For one week, track only completed items — not items touched, opened, or "in progress".',
      watchFor: 'The gap between how busy the team feels and how much actually shipped.'
    },
    {
      principle: 'Keep ready backup work',
      action: 'Before your next likely disruption (late delivery, bad weather, absent approver), keep a short list of useful work that has no dependencies.',
      watchFor: 'Nobody standing idle when the disruption arrives.'
    },
    {
      principle: "Don't push unready work",
      action: 'Next time you feel pressure to look busy, name the prerequisite that is missing out loud instead of starting anyway.',
      watchFor: 'Rework you avoided by waiting.'
    },
  ],
};

export default function Debrief() {
  const { lpi, chapter, week, dailyMetrics, dailyCommitments } = useGameStore();
  const [location, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation('/game');
  };

  // No synthetic fallback: this page previously substituted invented numbers when no days had
  // been played, which would present fabricated performance as the player's own report.
  const chartData = dailyMetrics;
  const hasData = chartData.length > 0;

  /**
   * Explains *why* each day went the way it did, from the player's own recorded numbers.
   * Charting the outcome alone teaches nothing — naming the cause is what transfers.
   */
  const findings: { day: number; verdict: 'good' | 'bad' | 'neutral'; text: string }[] = [];
  for (const m of chartData) {
    const wip = m.wipAtClose ?? 0;
    const limit = m.wipLimit ?? 0;
    const promised = m.committed ?? dailyCommitments[m.day];
    // Must be the true task count, not the chart-scaled `tasksCompletedToday`.
    const delivered = m.deliveredActual ?? 0;

    if (limit > 0 && wip > limit) {
      findings.push({
        day: m.day,
        verdict: 'bad',
        text: `Closed with ${wip} tasks open against a limit of ${limit}. Only ${delivered} finished — work spread thinner than the crew could absorb, so throughput fell. This is the WIP effect.`
      });
    } else if (limit > 0 && wip === 0 && delivered === 0) {
      findings.push({
        day: m.day,
        verdict: 'bad',
        text: `Nothing open and nothing finished. Idle capacity is as costly as congestion — overhead is charged either way.`
      });
    } else if (m.efficiency >= 80) {
      findings.push({
        day: m.day,
        verdict: 'good',
        text: `Held WIP at ${wip}${limit ? `/${limit}` : ''} and finished ${delivered}, hitting ${m.efficiency}% efficiency. Fewer things open, more things done.`
      });
    }

    if (promised !== undefined) {
      if (delivered >= promised) {
        findings.push({
          day: m.day,
          verdict: 'good',
          text: `Promised ${promised}, delivered ${delivered}. A promise you keep is what lets the next trade plan around you.`
        });
      } else {
        findings.push({
          day: m.day,
          verdict: 'bad',
          text: `Promised ${promised} but delivered ${delivered}. Over-promising is why schedules stop being believed — a smaller number you hit is worth more than a bigger one you miss.`
        });
      }
    }
  }

  const overWipDays = chartData.filter(m => (m.wipLimit ?? 0) > 0 && (m.wipAtClose ?? 0) > (m.wipLimit ?? 0));
  const avgEffOverWip = overWipDays.length
    ? Math.round(overWipDays.reduce((a, m) => a + m.efficiency, 0) / overWipDays.length)
    : null;
  const withinDays = chartData.filter(m => (m.wipLimit ?? 0) > 0 && (m.wipAtClose ?? 0) <= (m.wipLimit ?? 0));
  const avgEffWithin = withinDays.length
    ? Math.round(withinDays.reduce((a, m) => a + m.efficiency, 0) / withinDays.length)
    : null;

  const actions = REAL_WORLD_ACTIONS[chapter] ?? [];

  return (
    // h-dvh (not min-h-screen): min-h-screen is unbounded, so this div just grows to fit its
    // content instead of ever scrolling internally — the overflow was clipped one level up at
    // #root (which IS height-capped, see index.css), with no way to reach it. Measured live: this
    // clipped the "Advance to Next Phase" button — the ONLY way to continue past this screen —
    // entirely off-screen on a phone. h-dvh gives this div an actual bounded height so its own
    // overflow-y-auto can do something.
    <div className="w-full h-dvh bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 text-white overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-slate-900 rounded-[2rem] p-6 md:p-12 shadow-[0_0_80px_rgba(59,130,246,0.15)] border border-slate-800"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 uppercase tracking-tighter text-balance">
              Site Performance Report
            </h1>
            <div className="flex items-center gap-3">
               <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400 text-xs font-bold border border-slate-700 uppercase">Chapter {chapter}</span>
               <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-400 text-xs font-bold border border-slate-700 uppercase">Week {week}</span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LPI Score</div>
              <div className="text-3xl font-black text-blue-400">{(lpi.flowEfficiency + lpi.teamMorale) / 2}%</div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 flex items-center justify-center">
               <span className="text-xl font-bold">LPI</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Main Visual: Flow Trend */}
          <div className="lg:col-span-2 bg-slate-800/30 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
            <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
               <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Flow Efficiency Trend
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                    activeDot={{ r: 6 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Stats: Radial/Bar progress */}
          <div className="flex flex-col gap-4">
             <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 flex-1">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Throughput</span>
                  <span className="text-emerald-400 font-mono text-xs font-bold">{chartData.reduce((acc, d) => acc + (d.deliveredActual ?? 0), 0)} Total</span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                        formatter={(value: number, name: string) => [value, name === 'tasksCompletedToday' ? 'Completed' : 'Capacity']}
                      />
                      <Bar dataKey="potentialCapacity" fill="#334155" radius={[4, 4, 0, 0]} name="Capacity" />
                      <Bar dataKey="tasksCompletedToday" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 flex-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Workfront Health</span>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-400">TEAM MORALE</span>
                      <span className="text-green-400">{lpi.teamMorale}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${lpi.teamMorale}%` }}
                        className="h-full bg-gradient-to-r from-green-600 to-green-400" 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-slate-400">WIP COMPLIANCE</span>
                      <span className="text-yellow-400">{lpi.wipCompliance}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${lpi.wipCompliance}%` }}
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" 
                      />
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* WHY it went that way — the part that actually teaches. */}
        {hasData && (
          <div className="mb-10 bg-slate-800/30 p-6 rounded-3xl border border-slate-800/50">
            <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span> What Caused It
            </h3>

            {avgEffOverWip !== null && avgEffWithin !== null && (
              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-4">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Within WIP limit</div>
                  <div className="text-3xl font-black text-emerald-400">{avgEffWithin}%</div>
                  <div className="text-[11px] text-slate-400 mt-1">avg efficiency across {withinDays.length} day{withinDays.length === 1 ? '' : 's'}</div>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4">
                  <div className="text-[10px] font-black text-red-400 uppercase tracking-widest">Over WIP limit</div>
                  <div className="text-3xl font-black text-red-400">{avgEffOverWip}%</div>
                  <div className="text-[11px] text-slate-400 mt-1">avg efficiency across {overWipDays.length} day{overWipDays.length === 1 ? '' : 's'}</div>
                </div>
                <p className="col-span-2 text-xs text-slate-400 leading-relaxed">
                  That difference is the entire lesson of this chapter, measured on your own site — not
                  asserted at you in a tooltip.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {findings.length === 0 && (
                <p className="text-sm text-slate-500">No notable events recorded yet.</p>
              )}
              {findings.map((f, i) => (
                <div
                  key={i}
                  className={`flex gap-3 p-3 rounded-xl border text-sm leading-snug ${
                    f.verdict === 'good'
                      ? 'bg-emerald-900/10 border-emerald-500/25 text-emerald-100'
                      : f.verdict === 'bad'
                        ? 'bg-amber-900/10 border-amber-500/25 text-amber-100'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-300'
                  }`}
                >
                  <span className="shrink-0 font-black text-[10px] uppercase tracking-widest opacity-70 mt-0.5">
                    Day {f.day}
                  </span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transfer to the real job. */}
        {actions.length > 0 && (
          <div className="mb-10 bg-cyan-950/20 p-6 rounded-3xl border border-cyan-500/25">
            <h3 className="text-cyan-300 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span> Try This At Work
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              You can only claim to have learned these once they change what you do. Pick one.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {actions.map((a, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
                  <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1.5">{a.principle}</div>
                  <p className="text-sm text-slate-200 font-medium leading-snug mb-2">{a.action}</p>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    <span className="font-bold text-slate-300">Watch for:</span> {a.watchFor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center bg-blue-600/5 p-8 rounded-[2rem] border border-blue-500/20 gap-6">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="text-5xl font-black text-white">DEV</div>
            <div>
              <h4 className="font-black text-white text-xl uppercase tracking-tight">"Stability is the foundation of Improvement."</h4>
              <p className="text-blue-400/80 text-sm font-bold uppercase tracking-widest mt-1">Site Engineer's Observation</p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            className="group relative px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:translate-y-0 uppercase tracking-widest text-sm"
          >
            Advance to Next Phase
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
