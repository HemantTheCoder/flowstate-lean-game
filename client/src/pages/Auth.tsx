import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, HardHat, ArrowLeft, ShieldCheck, UserPlus, LogIn, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import soundManager from "@/lib/soundManager";

export default function AuthPage() {
    const { user, loginMutation, registerMutation, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    // Form State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState("login");

    useEffect(() => {
        // Redir if already logged in
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        soundManager.playSFX('click');
        loginMutation.mutate({ username, password }, {
            onSuccess: () => {
                toast({ title: "Welcome back!", description: "You are now logged in." });
                setLocation("/");
            },
            onError: (error: Error) => {
                toast({ title: "Login failed", description: error.message, variant: "destructive" });
            }
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        soundManager.playSFX('click');
        registerMutation.mutate({ username, password }, {
            onSuccess: () => {
                toast({ title: "Account created!", description: "You are now logged in." });
                setLocation("/");
            },
            onError: (error: Error) => {
                toast({ title: "Registration failed", description: error.message, variant: "destructive" });
            }
        });
    };

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/bg_title_screen.png')] bg-cover opacity-10 grayscale scale-110" />
                <div className="relative flex flex-col items-center gap-4">
                    <Loader2 className="w-16 h-16 text-cyan-500 animate-spin" />
                    <span className="text-cyan-400 font-black text-xs uppercase tracking-[0.3em]">Syncing Data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-950 px-4 md:px-0 font-sans">

            {/* Dark Construction Site Background */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
                    style={{ backgroundImage: "url('/assets/construction_bg.png')" }}
                />
                {/* Heavy Gradient Overlays for Visibility */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-slate-900/40" />
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
            </div>

            {/* Subtle Particles */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: "110%",
                            opacity: 0,
                        }}
                        animate={{
                            y: "-10%",
                            opacity: [0, 0.2, 0],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 15,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "linear"
                        }}
                        className="absolute w-1 h-1 rounded-full bg-cyan-400/20"
                    />
                ))}
            </div>

            {/* Back Button */}
            <div className="absolute top-8 left-8 z-50">
                <button
                    onClick={() => setLocation("/")}
                    className="group flex items-center gap-3 px-5 py-2.5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-slate-300 transition-all hover:text-white hover:border-cyan-500/50 hover:bg-slate-800"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Site</span>
                </button>
            </div>

            {/* Main Auth Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-20 w-full max-w-md mx-auto"
            >
                <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">

                    {/* Header Branding */}
                    <div className="p-10 text-center border-b border-white/5 bg-white/[0.02]">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950/50 border border-white/10 mb-6 group transition-all hover:border-cyan-500/30">
                            <HardHat className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                        </div>

                        <h1 className="text-4xl font-black text-white tracking-tighter mb-1">
                            FLOW<span className="text-cyan-400">STATE</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Lean Engineering Portal</p>
                    </div>

                    <div className="p-10 pt-8">
                        <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 bg-slate-950 border border-white/5 p-1 rounded-2xl mb-10">
                                <TabsTrigger
                                    value="login"
                                    className="rounded-xl data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest transition-all py-3"
                                >
                                    Login
                                </TabsTrigger>
                                <TabsTrigger
                                    value="register"
                                    className="rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest transition-all py-3"
                                >
                                    Register
                                </TabsTrigger>
                            </TabsList>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === "login" ? (
                                        <form onSubmit={handleLogin} className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Architect Username</Label>
                                                    <Input
                                                        placeholder="Enter username"
                                                        className="bg-slate-950 border-slate-800 focus:border-cyan-500/50 h-14 rounded-xl text-white placeholder:text-slate-700 px-5 text-base md:text-sm transition-all"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security Key</Label>
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="bg-slate-950 border-slate-800 focus:border-cyan-500/50 h-14 rounded-xl text-white placeholder:text-slate-700 px-5 text-base md:text-sm transition-all"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-14 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition-all"
                                                disabled={loginMutation.isPending}
                                            >
                                                {loginMutation.isPending ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <span className="flex items-center gap-3">
                                                        <LogIn className="w-4 h-4" />
                                                        Verify Access
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleRegister} className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Architect Code</Label>
                                                    <Input
                                                        placeholder="Create username"
                                                        className="bg-slate-950 border-slate-800 focus:border-indigo-500/50 h-14 rounded-xl text-white placeholder:text-slate-700 px-5 text-base md:text-sm transition-all"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Profile Passphrase</Label>
                                                    <Input
                                                        type="password"
                                                        placeholder="Choose password"
                                                        className="bg-slate-950 border-slate-800 focus:border-indigo-500/50 h-14 rounded-xl text-white placeholder:text-slate-700 px-5 text-base md:text-sm transition-all"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-900/20 active:scale-[0.98] transition-all"
                                                disabled={registerMutation.isPending}
                                            >
                                                {registerMutation.isPending ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <span className="flex items-center gap-3">
                                                        <UserPlus className="w-4 h-4" />
                                                        Confirm Profile
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </Tabs>
                    </div>

                    {/* Footer Status */}
                    <div className="bg-slate-950/80 p-6 flex items-center justify-center gap-2 border-t border-white/5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Encrypted Session Enabled</span>
                    </div>
                </div>

                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center mt-8 opacity-50">
                    By accessing, you agree to Site Safety & Data Protocols.
                </p>
            </motion.div>
        </div>
    );
}
