import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Bug, Lightbulb, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Feedback() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const { playerName } = useGameStore();
    const { toast } = useToast();

    const [type, setType] = useState<'suggestion' | 'bug' | 'other'>('suggestion');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Fallback to local gameStore name if not logged in, or generic
    const defaultName = user?.username || playerName || 'Guest Engineer';

    const mutation = useMutation({
        mutationFn: async (data: { type: string; message: string; playerName: string; email: string }) => {
            const res = await apiRequest('POST', '/api/feedback', data);
            return res.json();
        },
        onSuccess: () => {
            setSubmitted(true);
            toast({
                title: "Report Transmitted",
                description: "Your feedback has been securely sent to HQ. Thank you!",
                duration: 3000,
            });
            setTimeout(() => {
                setLocation('/');
            }, 3000);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        mutation.mutate({ type, message, playerName: defaultName, email });
    };

    return (
        <div className="min-h-screen bg-slate-900 p-4 md:p-8 font-sans relative overflow-x-hidden text-slate-200 flex flex-col items-center justify-center">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 blur-[150px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-15 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="w-full max-w-2xl z-10">
                <button
                    onClick={() => setLocation('/')}
                    className="group flex items-center gap-2 text-slate-400 hover:text-white mb-8 font-bold text-sm tracking-widest uppercase transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to HQ
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl relative"
                >
                    <div className="p-8 border-b border-slate-700/50 bg-slate-900/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
                        <h1 className="text-3xl font-black text-white flex items-center gap-3 relative z-10">
                            <MessageSquare className="w-8 h-8 text-cyan-400" />
                            Field Report
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium relative z-10">Submit bugs, feedback, and suggestions directly to the engineering team.</p>
                    </div>

                    <div className="p-8">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">Report Received!</h2>
                                <p className="text-slate-400 font-medium">Thank you for your transmission. Returning to HQ...</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Type Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setType('suggestion')}
                                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${type === 'suggestion'
                                            ? 'bg-cyan-900/40 border-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                                            : 'bg-slate-900/40 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                                            }`}
                                    >
                                        <Lightbulb className={`w-8 h-8 mb-3 ${type === 'suggestion' ? 'text-cyan-400' : 'text-slate-500'}`} />
                                        <span className="font-bold tracking-widest uppercase text-[11px]">Suggestion</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setType('bug')}
                                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${type === 'bug'
                                            ? 'bg-red-900/40 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                            : 'bg-slate-900/40 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                                            }`}
                                    >
                                        <Bug className={`w-8 h-8 mb-3 ${type === 'bug' ? 'text-red-400' : 'text-slate-500'}`} />
                                        <span className="font-bold tracking-widest uppercase text-[11px]">Report Bug</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setType('other')}
                                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${type === 'other'
                                            ? 'bg-indigo-900/40 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                            : 'bg-slate-900/40 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                                            }`}
                                    >
                                        <MessageSquare className={`w-8 h-8 mb-3 ${type === 'other' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                        <span className="font-bold tracking-widest uppercase text-[11px]">Other Feedback</span>
                                    </button>
                                </div>

                                {/* Message Input */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-bold tracking-widest uppercase text-slate-300 ml-1">
                                            Contact Email (Optional)
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="engineer@flowstate.com"
                                            className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-bold tracking-widest uppercase text-slate-300 ml-1">
                                            Transmission Details
                                        </label>
                                        <textarea
                                            id="message"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Describe the issue, idea, or feedback in detail..."
                                            className="w-full h-40 bg-slate-900/50 border-2 border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
                                            required
                                        />
                                        <p className="text-xs text-slate-500 text-right font-medium">Reporting as: <span className="text-slate-300">{defaultName}</span></p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={mutation.isPending || !message.trim()}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl text-white font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {mutation.isPending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Transmitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Submit Report
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
