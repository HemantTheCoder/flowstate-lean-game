import { TaskType } from '@/data/tasks';

const STORAGE_KEY = 'flowstate_custom_tasks';

export function saveCustomTasks(tasks: TaskType[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.warn('[CustomTaskStorage] Failed to save:', e);
    }
}

export function loadCustomTasks(): TaskType[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as TaskType[];
    } catch (e) {
        console.warn('[CustomTaskStorage] Failed to load:', e);
        return [];
    }
}

export function clearCustomTasks(): void {
    localStorage.removeItem(STORAGE_KEY);
}
