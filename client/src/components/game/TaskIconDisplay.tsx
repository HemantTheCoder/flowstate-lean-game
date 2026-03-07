import React from 'react';
import { TaskIcon } from '@/data/tasks';
import { Hammer, Cpu, Paintbrush, ClipboardList } from 'lucide-react';

/** Fallback Lucide icon by task type */
const FALLBACK_ICONS: Record<string, React.FC<{ className?: string }>> = {
    Structural: Hammer,
    Systems: Cpu,
    Interior: Paintbrush,
    Management: ClipboardList,
};

interface TaskIconDisplayProps {
    icon?: TaskIcon;
    type: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = {
    sm: { px: 24, cls: 'w-6 h-6' },
    md: { px: 32, cls: 'w-8 h-8' },
    lg: { px: 48, cls: 'w-12 h-12' },
};

export const TaskIconDisplay: React.FC<TaskIconDisplayProps> = ({
    icon,
    type,
    size = 'sm',
    className = '',
}) => {
    const { cls } = sizeMap[size];

    if (icon?.src) {
        return (
            <img
                src={icon.src}
                alt={icon.alt || 'Task icon'}
                className={`${cls} rounded-lg object-cover flex-shrink-0 ${className}`}
                loading="lazy"
            />
        );
    }

    // Fallback: render Lucide icon based on task type
    const FallbackIcon = FALLBACK_ICONS[type] || ClipboardList;
    const colorMap: Record<string, string> = {
        Structural: 'text-cyan-400',
        Systems: 'text-emerald-400',
        Interior: 'text-amber-400',
        Management: 'text-purple-400',
    };

    return (
        <div className={`${cls} rounded-lg flex items-center justify-center bg-slate-700/50 border border-slate-600/30 flex-shrink-0 ${className}`}>
            <FallbackIcon className={`w-3/5 h-3/5 ${colorMap[type] || 'text-slate-400'}`} />
        </div>
    );
};
