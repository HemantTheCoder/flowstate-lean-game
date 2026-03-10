import { motion, AnimatePresence } from 'framer-motion';
import { Book, X, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface GlossaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  chapter: string;
}

interface GlossaryCategory {
  category: string;
  terms: GlossaryTerm[];
}

const glossaryData: GlossaryCategory[] = [
  {
    category: 'Core Concepts',
    terms: [
      {
        term: 'Lean Construction',
        definition: 'Applying lean manufacturing principles to construction to maximize value and minimize waste.',
        chapter: 'Ch1',
      },
      {
        term: 'Kanban',
        definition: 'A visual workflow management method using cards and columns to control WIP.',
        example: 'Each task is a card that moves through columns: To Do, Doing, Done.',
        chapter: 'Ch1',
      },
      {
        term: 'WIP (Work In Progress)',
        definition: 'Tasks currently being worked on. Limiting WIP prevents bottlenecks and keeps work flowing smoothly.',
        example: 'Like the number of active work fronts on a construction site.',
        chapter: 'Ch1',
      },
      {
        term: 'WIP Limit',
        definition: 'Maximum number of tasks allowed in a column at once to prevent overload.',
        example: 'Prevents overloading workers and creates a natural pull system.',
        chapter: 'Ch1',
      },
      {
        term: 'Waste (Muda)',
        definition: 'Any activity that consumes resources but doesn\'t add value. The 8 wastes include: defects, overproduction, waiting, non-utilized talent, transportation, inventory, motion, extra-processing.',
        example: 'Rework, waiting, overproduction, unnecessary material movement.',
        chapter: 'Ch1',
      },
    ],
  },
  {
    category: 'Flow States',
    terms: [
      {
        term: 'Flow',
        definition: 'The smooth movement of work through the system from start to finish without interruption.',
        chapter: 'Ch1',
      },
      {
        term: 'Bottleneck',
        definition: 'A point where work piles up because capacity is exceeded, slowing the entire system.',
        example: 'Like a traffic jam on site where one trade blocks others.',
        chapter: 'Ch1',
      },
      {
        term: 'Starvation',
        definition: 'When workers have no tasks to do because upstream hasn\'t delivered.',
        example: 'Idle crews cost money and delay the project.',
        chapter: 'Ch1',
      },
    ],
  },
  {
    category: 'Metrics & Measurement',
    terms: [
      {
        term: 'Throughput',
        definition: 'The rate at which tasks are completed through the system.',
        example: 'Higher throughput = more work done per day.',
        chapter: 'Ch1',
      },
      {
        term: 'Cycle Time',
        definition: 'Time from when a task starts (enters Doing) to when it finishes (enters Done).',
        example: 'Lower cycle times indicate more efficient work processes.',
        chapter: 'Ch1',
      },
      {
        term: 'PPC (Percent Plan Complete)',
        definition: 'The key metric of LPS reliability. PPC = (Tasks Completed / Tasks Promised) x 100. Measures how many promises were kept, not total productivity.',
        example: 'If you promised 8 tasks and completed 6, your PPC is 75%. Target: 80%+.',
        chapter: 'Ch2',
      },
      {
        term: 'Lead Time',
        definition: 'Total time from when a task is requested to when it is delivered, including waiting time.',
        example: 'A task may have a 2-day cycle time but a 10-day lead time if it waited 8 days to start.',
        chapter: 'Ch4',
      },
      {
        term: 'Takt Time',
        definition: 'The pace of production needed to meet customer demand. Calculated as available time divided by demand.',
        example: 'If 10 units of flooring must be installed in 5 days, takt time is 0.5 days per unit.',
        chapter: 'Ch4',
      },
    ],
  },
  {
    category: 'Last Planner System',
    terms: [
      {
        term: 'Last Planner System (LPS)',
        definition: 'A production planning system that works backward from commitments. Plans are made at the last responsible moment by the people who will do the work.',
        example: 'Instead of a PM dictating tasks, the foreman and crew plan what they WILL do based on what they CAN do.',
        chapter: 'Ch2',
      },
      {
        term: 'Should / Can / Will',
        definition: 'Three levels of planning. SHOULD = Master Schedule (what needs to happen). CAN = Lookahead (what is possible after checking constraints). WILL = Weekly Work Plan (what you commit to deliver).',
        chapter: 'Ch2',
      },
      {
        term: 'Constraint',
        definition: 'Any prerequisite or condition that prevents a task from being executed. Common types: material delivery, crew availability, design approvals, weather conditions.',
        example: 'A task to install windows has a constraint if the window supplier hasn\'t delivered yet.',
        chapter: 'Ch2',
      },
      {
        term: 'Make Ready',
        definition: 'The process of actively identifying and removing constraints so that tasks become "Sound" and executable. This happens during the Lookahead phase.',
        example: 'Calling the supplier to confirm delivery, booking the crane, and briefing the crew are all Make Ready actions.',
        chapter: 'Ch2',
      },
      {
        term: 'Sound Activity',
        definition: 'A task with ALL constraints removed. It is fully ready to execute - materials are on site, crew is available, approvals are granted, and prerequisites are complete.',
        chapter: 'Ch2',
      },
      {
        term: 'Weekly Work Plan',
        definition: 'The set of tasks committed for the current week. Only Sound activities (green, no constraints) should be included. This is your PROMISE to the team.',
        chapter: 'Ch2',
      },
      {
        term: 'Reliable Promise',
        definition: 'A commitment made only after verifying all prerequisites are met. Reliable promises build trust between trades, with clients, and within the team.',
        example: 'Saying "I WILL finish the electrical rough-in by Friday" after confirming conduit is delivered, crew is scheduled, and walls are framed.',
        chapter: 'Ch2',
      },
    ],
  },
  {
    category: '5S Methodology',
    terms: [
      {
        term: '5S',
        definition: 'A workplace organization method consisting of Sort, Set in Order, Shine, Standardize, and Sustain. Foundational to lean operations.',
        chapter: 'Ch3',
      },
      {
        term: 'Sort (Seiri)',
        definition: 'Separating needed tools, parts, and instructions from unneeded materials and removing the latter.',
        example: 'Red-tagging unused equipment in a storage depot for removal.',
        chapter: 'Ch3',
      },
      {
        term: 'Set in Order (Seiton)',
        definition: 'Arranging and labeling items so they are easy to use and find by anyone. A place for everything and everything in its place.',
        example: 'Using Shadow Boards so every tool has a designated spot.',
        chapter: 'Ch3',
      },
      {
        term: 'Shine (Seiso)',
        definition: 'Cleaning the workspace and equipment as a form of inspection to find abnormalities early.',
        example: 'Daily sweeping reveals cracks or leaks before they become safety hazards.',
        chapter: 'Ch3',
      },
      {
        term: 'Standardize (Seiketsu)',
        definition: 'Creating strict guidelines, schedules, and visual controls to maintain the first 3S phases consistently.',
        chapter: 'Ch3',
      },
      {
        term: 'Sustain (Shitsuke)',
        definition: 'Building the discipline and culture to uphold the rules of 5S over the long term without backsliding.',
        chapter: 'Ch3',
      },
      {
        term: 'Red Tag',
        definition: 'A visual method to identify unneeded items during the "Sort" phase for removal from the workspace.',
        example: 'Placing red tags on broken tools so they are flagged for disposal or repair.',
        chapter: 'Ch3',
      },
      {
        term: 'Shadow Board',
        definition: 'A visual management tool where outlines of tools are drawn to indicate exactly where they belong.',
        example: 'If a hammer is missing from the shadow board, anyone can immediately see it needs to be returned.',
        chapter: 'Ch3',
      },
    ],
  },
  {
    category: 'Just-in-Time & Pull',
    terms: [
      {
        term: 'Pull System',
        definition: 'Work is "pulled" into production only when there is capacity, preventing overproduction and WIP buildup.',
        example: 'Workers pull tasks when ready, rather than being pushed work they cannot handle.',
        chapter: 'Ch4',
      },
      {
        term: 'Push System',
        definition: 'Work is forced into production regardless of capacity, often creating congestion, rework, and waste.',
        example: 'Scheduling all trades to start simultaneously without checking readiness.',
        chapter: 'Ch1',
      },
      {
        term: 'Just-in-Time (JIT)',
        definition: 'A strategy to deliver materials and start tasks exactly when needed - not too early (wasting space/money) and not too late (causing delays).',
        example: 'Concrete arrives on the morning of the pour, not a week before taking up yard space.',
        chapter: 'Ch4',
      },
      {
        term: 'Supermarket (Buffer)',
        definition: 'A controlled inventory of items maintained between processes to ensure downstream work is never starved.',
        example: 'A small stock of pre-cut rebar kept near the formwork area so ironworkers always have material.',
        chapter: 'Ch4',
      },
      {
        term: 'Kanban Signal',
        definition: 'A visual or electronic trigger that authorizes the production or movement of items in a pull system.',
        example: 'An empty bin on the shelf signals the warehouse to replenish that material.',
        chapter: 'Ch4',
      },
      {
        term: 'Continuous Improvement (Kaizen)',
        definition: 'The practice of making small, incremental improvements to processes over time rather than large, infrequent changes.',
        example: 'After each sprint, the team identifies one thing to improve for the next week.',
        chapter: 'Ch4',
      },
      {
        term: 'Value Stream',
        definition: 'All the steps (both value-adding and non-value-adding) required to bring a product from raw materials to the customer.',
        example: 'Mapping every step from design to handover reveals where time is wasted.',
        chapter: 'Ch4',
      },
    ],
  },
];

const chapterColors: Record<string, string> = {
  'Ch1': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Ch2': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Ch3': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Ch4': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const chapterNames: Record<string, string> = {
  'Ch1': 'Kanban Flow',
  'Ch2': 'Last Planner',
  'Ch3': '5S Order',
  'Ch4': 'JIT & Pull',
};

export const GlossaryPanel = ({ isOpen, onClose }: GlossaryPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChapterFilter, setActiveChapterFilter] = useState<string | null>(null);

  const filteredData = glossaryData.map((category) => ({
    ...category,
    terms: category.terms.filter((term) => {
      const matchesSearch =
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.example?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChapter = !activeChapterFilter || term.chapter === activeChapterFilter;
      return matchesSearch && matchesChapter;
    }),
  })).filter((category) => category.terms.length > 0);

  const totalTerms = glossaryData.reduce((sum, cat) => sum + cat.terms.length, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            data-testid="panel-glossary"
            className="fixed right-0 top-0 h-screen w-full max-w-md z-[301] bg-slate-900 rounded-l-3xl shadow-2xl flex flex-col border-l border-slate-700/50"
          >
            <div className="flex items-center justify-between gap-2 p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Glossary</h2>
                <span data-testid="text-glossary-count" className="text-xs text-slate-500">
                  {totalTerms} terms
                </span>
              </div>
              <button
                onClick={onClose}
                data-testid="button-close-glossary"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close glossary"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-slate-800 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-glossary-search"
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-slate-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveChapterFilter(null)}
                  data-testid="button-filter-all"
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    !activeChapterFilter
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  All
                </button>
                {Object.entries(chapterNames).map(([ch, name]) => (
                  <button
                    key={ch}
                    onClick={() => setActiveChapterFilter(activeChapterFilter === ch ? null : ch)}
                    data-testid={`button-filter-${ch.toLowerCase()}`}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      activeChapterFilter === ch
                        ? chapterColors[ch] + ' border'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {ch}: {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredData.length > 0 ? (
                <div className="p-6 space-y-8">
                  {filteredData.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">
                        {category.category}
                      </h3>
                      <div className="space-y-4">
                        {category.terms.map((term) => (
                          <div key={term.term} data-testid={`glossary-term-${term.term.replace(/\s+/g, '-').toLowerCase()}`} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                              <h4 className="font-bold text-slate-200">
                                {term.term}
                              </h4>
                              <Badge
                                variant="outline"
                                data-testid={`badge-chapter-${term.term.replace(/\s+/g, '-').toLowerCase()}`}
                                className={`text-[10px] shrink-0 no-default-hover-elevate no-default-active-elevate ${chapterColors[term.chapter]}`}
                              >
                                {term.chapter}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">
                              {term.definition}
                            </p>
                            {term.example && (
                              <p className="text-sm text-slate-400 italic">
                                {term.example}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p data-testid="text-no-results" className="text-slate-400 text-center">No terms match your search.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
