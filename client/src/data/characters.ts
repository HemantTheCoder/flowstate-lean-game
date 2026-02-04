export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
}

export const CHARACTERS: Record<string, Character> = {
  Engineer: {
    id: 'Engineer',
    name: 'Engineer',
    role: 'Flow Architect',
    description: 'You — the newly hired Lean Construction specialist.',
    avatar: 'Engineer'
  },
  Mira: {
    id: 'Mira',
    name: 'Mira Chen',
    role: 'Project Manager',
    description: 'Organized and pragmatic. She keeps the project on track.',
    avatar: 'Mira'
  },
  Rao: {
    id: 'Rao',
    name: 'Rao Kumar',
    role: 'Site Supervisor',
    description: 'Hot-tempered but loyal. Believes in working harder, not smarter.',
    avatar: 'Rao'
  },
  'Old Foreman': {
    id: 'Old Foreman',
    name: 'Old Foreman',
    role: 'Senior Foreman',
    description: 'Decades of experience. Skeptical of new methods but respects results.',
    avatar: 'OldForeman'
  },
  Isha: {
    id: 'Isha',
    name: 'Isha Patel',
    role: 'Junior Planner',
    description: 'Eager to learn but often overwhelmed by the chaos.',
    avatar: 'Isha'
  },
  Client: {
    id: 'Client',
    name: 'Mr. Nakamura',
    role: 'Client Representative',
    description: 'Demands reliability and hates excuses. The final judge.',
    avatar: 'Client'
  },
  Advisor: {
    id: 'Advisor',
    name: 'Dr. Lean',
    role: 'LPS Advisor',
    description: 'Your mentor in the Last Planner System. Calm and methodical.',
    avatar: 'Advisor'
  },
  Inspector: {
    id: 'Inspector',
    name: 'Inspector Yang',
    role: 'Quality Inspector',
    description: 'Strict but fair. Measures what matters.',
    avatar: 'Inspector'
  }
};

export const CHAPTER_CHARACTERS: Record<number, string[]> = {
  1: ['Mira', 'Rao', 'Old Foreman', 'Isha'],
  2: ['Client', 'Old Foreman', 'Isha', 'Advisor']
};
