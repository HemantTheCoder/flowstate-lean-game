import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, HardHat, ArrowLeft, ShieldCheck, UserPlus, LogIn } from "lucide-react";
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
            setLocation("/profile");
        }
    }, [user, setLocation]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        soundManager.playSFX('click');
        loginMutation.mutate({ username, password }, {
            onSuccess: () => {
                toast({ title: "Welcome back!", description: "You are now logged in." });
                setLocation("/profile");
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
                setLocation("/profile");
            },
            onError: (error: Error) => {
                toast({ title: "Registration failed", description: error.message, variant: "destructive" });
            }
        });
    };

    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

            {/* Dark Industrial Background with Gradients */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md z-10"
            >
                {/* Back Button */}
                <button
                    onClick={() => setLocation("/")}
                    className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Title</span>
                </button>

                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden shadow-cyan-500/5">

                    {/* Header Branding */}
                    <div className="bg-slate-900/80 p-8 text-center border-b border-slate-800">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 mb-4 border border-slate-700 shadow-inner">
                            <HardHat className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">FLOW<span className="text-cyan-400">STATE</span></h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Lean Construction Portal</p>
                    </div>

                    <div className="p-8">
                        <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 bg-slate-950 border border-slate-800/50 p-1 rounded-xl mb-8">
                                <TabsTrigger
                                    value="login"
                                    className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    Log In
                                </TabsTrigger>
                                <TabsTrigger
                                    value="register"
                                    className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    Create Account
                                </TabsTrigger>
                            </TabsList>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === "login" ? (
                                        <form onSubmit={handleLogin} className="space-y-6">
                                            <div className="space-y-4 text-center mb-6">
                                                <h2 className="text-xl font-bold text-slate-200">Welcome Back</h2>
                                                <p className="text-sm text-slate-500 leading-relaxed">Continue your journey as a Lean Architect and sync your progress to the cloud.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="username" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</Label>
                                                    <Input
                                                        id="username"
                                                        placeholder="Enter your username"
                                                        className="bg-slate-950 border-slate-800 focus:border-cyan-500/50 h-12 text-slate-200"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="bg-slate-950 border-slate-800 focus:border-cyan-500/50 h-12 text-slate-200"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-xs relative overflow-hidden group shadow-lg shadow-cyan-900/20"
                                                disabled={loginMutation.isPending}
                                            >
                                                {loginMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <LogIn className="w-4 h-4" />
                                                        Verify Identity
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleRegister} className="space-y-6">
                                            <div className="space-y-4 text-center mb-6">
                                                <h2 className="text-xl font-bold text-slate-200">Initialize Profile</h2>
                                                <p className="text-sm text-slate-500 leading-relaxed">Create a persistent architectural profile to secure your career metrics and leaderboard standing.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="username-reg" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Architect Username</Label>
                                                    <Input
                                                        id="username-reg"
                                                        placeholder="How should the crew call you?"
                                                        className="bg-slate-950 border-slate-800 focus:border-indigo-500/50 h-12 text-slate-200"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="password-reg" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security Key</Label>
                                                    <Input
                                                        id="password-reg"
                                                        type="password"
                                                        placeholder="Choose a strong password"
                                                        className="bg-slate-950 border-slate-800 focus:border-indigo-500/50 h-12 text-slate-200"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs relative overflow-hidden group shadow-lg shadow-indigo-900/20"
                                                disabled={registerMutation.isPending}
                                            >
                                                {registerMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <UserPlus className="w-4 h-4" />
                                                        Confirm Registration
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </Tabs>
                    </div>

                    <div className="bg-slate-950/80 p-6 flex items-center justify-center gap-2 border-t border-slate-800">
                        <ShieldCheck className="w-4 h-4 text-slate-600" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Encrypted Cloud Access Active</span>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                        By initializing access, you agree to comply with<br />site security & data management protocols.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
