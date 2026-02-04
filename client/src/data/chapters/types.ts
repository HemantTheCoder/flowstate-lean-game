import { DialogueLine } from '@/store/gameStore';

export type ChapterEvent = 
  | 'rain' 
  | 'supply_delay' 
  | 'inspection' 
  | 'decision_push'
  | 'tutorial_start'
  | 'constraints_visible'
  | 'client_pressure'
  | 'recovery'
  | 'chapter_complete';

export interface DayConfig {
    day: number;
    title: string;
    description: string;
    lesson: string;
    event?: ChapterEvent;
    dialogue: DialogueLine[];
    briefing?: {
        objective: string;
        action: string;
    };
}
