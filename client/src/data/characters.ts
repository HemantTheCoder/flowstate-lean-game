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
    name: 'Ranjit Kumar',
    role: 'Project Manager',
    description: 'Organized and pragmatic. Keeps the project on track.',
    avatar: 'Mira'
  },
  Rao: {
    id: 'Rao',
    name: 'Rajiv Patel',
    role: 'Site Supervisor',
    description: 'Hot-tempered but loyal. Believes in working harder, not smarter.',
    avatar: 'Rao'
  },
  'Old Foreman': {
    id: 'Old Foreman',
    name: 'Anil Yadav',
    role: 'Senior Foreman',
    description: 'Decades of experience. Skeptical of new methods but respects results.',
    avatar: 'OldForeman'
  },
  Isha: {
    id: 'Isha',
    name: 'Isha Shah',
    role: 'Junior Planner',
    description: 'Eager to learn but often overwhelmed by the chaos.',
    avatar: 'Isha'
  },
  Client: {
    id: 'Client',
    name: 'Priya Patel',
    role: 'Client Representative',
    description: 'Demands reliability and hates excuses. The final judge.',
    avatar: 'Client'
  },
  Advisor: {
    id: 'Advisor',
    name: 'Shikha Doshi',
    role: 'LPS Advisor',
    description: 'Your mentor in the Last Planner System. Calm and methodical.',
    avatar: 'Advisor'
  },
  Inspector: {
    id: 'Inspector',
    name: 'Sumit Chaudhary',
    role: 'Quality Inspector',
    description: 'Strict but fair. Measures what matters.',
    avatar: 'Inspector'
  },
  Owner: {
    id: 'Owner',
    name: 'Arun Sharma',
    role: 'Client Owner',
    description: 'The primary stakeholder. Cares deeply about budget and timely delivery.',
    avatar: 'Owner'
  }
};

export const CHAPTER_CHARACTERS: Record<number, string[]> = {
  1: ['Mira', 'Rao', 'Old Foreman', 'Isha'],
  2: ['Client', 'Old Foreman', 'Isha', 'Advisor'],
  3: ['Rao', 'Mira', 'Advisor', 'Isha'],
  4: ['Mira', 'Client', 'Inspector', 'Rao'], // Case Study 1
  5: ['Old Foreman', 'Advisor', 'Isha', 'Client'] // Case Study 2
};
