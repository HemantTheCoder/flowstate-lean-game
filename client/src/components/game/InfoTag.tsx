import React, { useState } from 'react';

// A title= attribute only shows on hover, which doesn't exist on touch - wrap the
// explainer so tapping (as well as hovering, for desktop) reveals the same text.
export const InfoTag: React.FC<{ tooltip: string; className?: string; panelClassName?: string; children: React.ReactNode }> = ({ tooltip, className, panelClassName, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <span className="relative inline-flex min-w-0">
            <button
                type="button"
                title={tooltip}
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                className={`touch-manipulation min-w-0 ${className || ''}`}
            >
                {children}
            </button>
            {open && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={panelClassName || 'absolute z-40 bottom-full mb-2 right-0 w-56 max-w-[70vw] p-2.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xl text-[10px] font-medium normal-case tracking-normal text-slate-300'}
                >
                    {tooltip}
                </div>
            )}
        </span>
    );
};
