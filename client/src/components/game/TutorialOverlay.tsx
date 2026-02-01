// Reading file to check for IDs...
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    showKanban: boolean;
}

export const TutorialOverlay: React.FC<Props> = ({ showKanban }) => {
    const { tutorialStep, tutorialActive, completeTutorial } = useGameStore();
    const [spotlightPos, setSpotlightPos] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

    // Dynamic Spotlight Logic
    useEffect(() => {
        if (!tutorialActive) return;

        const updateSpotlight = () => {
            let targetId = '';
            if (tutorialStep === 0 || tutorialStep === 1) targetId = 'btn-kanban';
            if (tutorialStep === 2) targetId = 'col-backlog';
            if (tutorialStep === 3) targetId = 'col-ready';
            if (tutorialStep === 4) targetId = 'col-doing';

            if (targetId) {
                const el = document.getElementById(targetId);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setSpotlightPos({
                        x: rect.left - 10,
                        y: rect.top - 10,
                        w: rect.width + 20,
                        h: rect.height + 20
                    });
                }
            } else {
                setSpotlightPos(null);
            }
        };

        // Update with short delay to allow DOM (KanbanBoard) to mount
        const timer = setTimeout(updateSpotlight, 300);
        window.addEventListener('resize', updateSpotlight);
        return () => {
            window.removeEventListener('resize', updateSpotlight);
            clearTimeout(timer);
        };
    }, [tutorialStep, tutorialActive, showKanban]);


    if (!tutorialActive || tutorialStep === 0) return null;

    // SVG Path for Spotlight (Hollow Box)
    const getMaskPath = () => {
        if (!spotlightPos) return "M0 0 h100% v100% h-100% z"; // Full cover
        const { x, y, w, h } = spotlightPos;
        // Outer box (Clockwise) + Inner box (Counter-clockwise) = Hole
        return `
            M0 0 h${window.innerWidth} v${window.innerHeight} h-${window.innerWidth} z 
            M${x} ${y} v${h} h${w} v-${h} z
        `;
    };

    return (
        <div className="absolute inset-0 z-[70] pointer-events-none overflow-hidden text-white font-bold text-shadow-lg">

            {/* Dark Overlay with Hole */}
            <svg className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
                <path d={getMaskPath()} fill="black" fillRule="evenodd" />
            </svg>

            <AnimatePresence>

                {/* Step 1: Open Board */}
                {tutorialStep === 1 && !showKanban && spotlightPos && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        style={{ top: spotlightPos.y + 20, left: spotlightPos.x - 320 }}
                        className="absolute flex items-center gap-4"
                    >
                        <div className="bg-blue-600 px-4 py-2 rounded-xl text-lg shadow-xl text-right">
                            Click the Chart <br /> to open Kanban!
                        </div>
                        <div className="text-4xl animate-bounce-horizontal">➡️</div>
                    </motion.div>
                )}

                {/* Board Open - Guidance (Steps 2-4) */}
                {showKanban && spotlightPos && (
                    <>
                        {/* Step 2: Backlog -> Ready */}
                        {tutorialStep === 2 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ top: spotlightPos.y - 100, left: spotlightPos.x }}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="text-5xl animate-bounce mb-2 text-center">⬇️</div>
                                <div className="bg-orange-500 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                    <p className="font-bold text-lg">Step 1: PULL</p>
                                    <p className="text-sm">Click a task here to move it to <b>Ready</b>.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Ready -> Doing */}
                        {tutorialStep === 3 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ top: spotlightPos.y - 120, left: spotlightPos.x }}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="text-5xl animate-bounce mb-2 text-center">⬇️</div>
                                <div className="bg-purple-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                    <p className="font-bold text-lg">Step 2: START</p>
                                    <p className="text-sm">Move to <b>Doing</b> to start work. <br />(Commits Materials)</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Doing -> Done */}
                        {tutorialStep === 4 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ top: spotlightPos.y - 120, left: spotlightPos.x }}
                                className="absolute z-[90] w-64 pointer-events-none"
                            >
                                <div className="text-5xl animate-bounce mb-2 text-center">⬇️</div>
                                <div className="bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl border-2 border-white">
                                    <p className="font-bold text-lg">Step 3: FINISH</p>
                                    <p className="text-sm">Move to <b>Done</b> to get Paid! <br />(Value Added)</p>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

                {/* Step 5: Complete */}
                {tutorialStep === 5 && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto z-[90]"
                    >
                        <div className="bg-yellow-400 text-black px-8 py-6 rounded-3xl shadow-2xl text-center border-4 border-white max-w-md">
                            <h2 className="text-3xl font-black mb-2">🎉 Great Job!</h2>
                            <p className="mb-4 font-medium">You've learned the flow of work! <br /> Respect WIP limits to keep the workers happy.</p>
                            <button
                                onClick={() => completeTutorial()}
                                className="bg-black text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                            >
                                Close Tutorial
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
