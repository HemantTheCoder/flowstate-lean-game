import { motion, AnimatePresence } from 'framer-motion';
import { Book, X, Search } from 'lucide-react';
import { useState } from 'react';

interface GlossaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
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
        term: 'WIP (Work In Progress)',
        definition: 'Tasks currently being worked on.',
        example: 'Like the number of active work fronts on a construction site.',
      },
      {
        term: 'WIP Limit',
        definition: 'Maximum number of tasks allowed in a column at once.',
        example: 'Prevents overloading workers.',
      },
      {
        term: 'Kanban',
        definition: 'A visual workflow management method using cards and columns to control WIP.',
      },
      {
        term: 'Lean Construction',
        definition: 'Applying lean manufacturing principles to construction to maximize value and minimize waste.',
      },
    ],
  },
  {
    category: 'Flow States',
    terms: [
      {
        term: 'Pull System',
        definition: 'Work is "pulled" into production only when there is capacity.',
        example: 'Workers pull tasks when ready, rather than being pushed.',
      },
      {
        term: 'Push System',
        definition: 'Work is forced into production regardless of capacity.',
        example: 'Creates congestion and waste.',
      },
      {
        term: 'Flow',
        definition: 'The smooth movement of work through the system from start to finish.',
      },
      {
        term: 'Throughput',
        definition: 'The rate at which tasks are completed.',
        example: 'Higher throughput = more work done per day.',
      },
    ],
  },
  {
    category: 'Lean Principles',
    terms: [
      {
        term: 'Bottleneck',
        definition: 'A point where work piles up because capacity is exceeded.',
        example: 'Like a traffic jam on site.',
      },
      {
        term: 'Starvation',
        definition: 'When workers have no tasks to do because upstream hasn\'t delivered.',
        example: 'Idle crews cost money.',
      },
      {
        term: 'Waste (Muda)',
        definition: 'Any activity that consumes resources but doesn\'t add value.',
        example: 'Rework, waiting, overproduction.',
      },
      {
        term: 'Cycle Time',
        definition: 'Time from when a task starts (enters Doing) to when it finishes (enters Done).',
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
      },
      {
        term: 'Should / Can / Will',
        definition: 'Three levels of planning. SHOULD = Master Schedule (what needs to happen). CAN = Lookahead (what is possible after checking constraints). WILL = Weekly Work Plan (what you commit to deliver).',
      },
      {
        term: 'Constraint',
        definition: 'Any prerequisite or condition that prevents a task from being executed. Common types: material delivery, crew availability, design approvals, weather conditions.',
        example: 'A task to install windows has a constraint if the window supplier hasn\'t delivered yet.',
      },
      {
        term: 'Make Ready',
        definition: 'The process of actively identifying and removing constraints so that tasks become "Sound" and executable. This happens during the Lookahead phase.',
        example: 'Calling the supplier to confirm delivery, booking the crane, and briefing the crew are all Make Ready actions.',
      },
      {
        term: 'Sound Activity',
        definition: 'A task with ALL constraints removed. It is fully ready to execute - materials are on site, crew is available, approvals are granted, and prerequisites are complete.',
      },
      {
        term: 'PPC (Percent Plan Complete)',
        definition: 'The key metric of LPS reliability. PPC = (Tasks Completed / Tasks Promised) x 100. Measures how many promises were kept, not total productivity.',
        example: 'If you promised 8 tasks and completed 6, your PPC is 75%. Target: 80%+.',
      },
      {
        term: 'Weekly Work Plan',
        definition: 'The set of tasks committed for the current week. Only Sound activities (green, no constraints) should be included. This is your PROMISE to the team.',
      },
      {
        term: 'Reliable Promise',
        definition: 'A commitment made only after verifying all prerequisites are met. Reliable promises build trust between trades, with clients, and within the team.',
        example: 'Saying "I WILL finish the electrical rough-in by Friday" after confirming conduit is delivered, crew is scheduled, and walls are framed.',
      },
    ],
  },
];

export const GlossaryPanel = ({ isOpen, onClose }: GlossaryPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = glossaryData.map((category) => ({
    ...category,
    terms: category.terms.filter((term) =>
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.example?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.terms.length > 0);

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
            className="fixed right-0 top-0 h-screen w-full max-w-md z-[301] bg-white rounded-l-3xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6 text-slate-700" />
                <h2 className="text-2xl font-bold text-slate-800">Glossary</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close glossary"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-glossary-search"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {filteredData.length > 0 ? (
                <div className="p-6 space-y-8">
                  {filteredData.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                        {category.category}
                      </h3>
                      <div className="space-y-4">
                        {category.terms.map((term) => (
                          <div key={term.term} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-2">
                              {term.term}
                            </h4>
                            <p className="text-sm text-slate-700 mb-2">
                              {term.definition}
                            </p>
                            {term.example && (
                              <p className="text-sm text-slate-600 italic">
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
                  <p className="text-slate-400 text-center">No terms match your search.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
