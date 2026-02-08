import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShieldAlert, Trash2, ArrowRight, Save, LayoutDashboard } from 'lucide-react';
import { useLocation } from 'wouter';

export default function DevDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [, navigate] = useLocation();

    const { setDay, setChapter, day, chapter, playerName } = useGameStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'banhae12@' || password === 'flowstate_dev') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Access Denied: Invalid Credentials');
        }
    };

    const handleClearLeaderboard = async () => {
        if (!confirm('⚠️ CRITICAL WARNING ⚠️\n\nThis will permanently delete ALL leaderboard entries for ALL players.\n\nAre you absolutely sure?')) return;

        try {
            await apiRequest('DELETE', '/api/leaderboard');
            await queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
            alert('✅ Leaderboard cleared successfully.');
        } catch (e) {
            console.error(e);
            alert('❌ Failed to clear leaderboard.');
        }
    };

    const handleResetLocal = () => {
        if (!confirm('This will wipe your local game progress. Continue?')) return;
        localStorage.removeItem('persist:game-storage');
        window.location.reload();
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-400">
                            <Terminal className="w-5 h-5" />
                            Developer Console
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Enter Access Key"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-950 border-slate-700 text-slate-100 font-mono"
                                />
                            </div>
                            {error && (
                                <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
                                    <ShieldAlert className="w-4 h-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                                Authenticate
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8 font-mono text-slate-300">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex items-center justify-between border-b border-slate-800 pb-6">
                    <h1 className="text-2xl font-bold text-indigo-400 flex items-center gap-3">
                        <Terminal className="w-8 h-8" />
                        FlowState // DevMode
                    </h1>
                    <div className="text-xs text-slate-500">
                        Session: <span className="text-emerald-500">Active</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Game State Control */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-slate-100 flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-blue-400" />
                                Game State
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Current State</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-slate-500">Player:</span> <span className="text-white">{playerName}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Chapter:</span> <span className="text-yellow-400">{chapter}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Day:</span> <span className="text-cyan-400">{day}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-slate-400">Teleport to Chapter</label>
                                <div className="flex gap-2">
                                    {[1, 2].map((c) => (
                                        <Button
                                            key={c}
                                            variant={chapter === c ? "default" : "outline"}
                                            onClick={() => { setChapter(c); alert(`Warped to Chapter ${c}`); }}
                                            className="border-slate-700 hover:bg-slate-800 hover:text-white"
                                        >
                                            Ch {c}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-slate-400">Teleport to Day (Current Ch)</label>
                                <div className="flex gap-2 flex-wrap">
                                    {[1, 2, 3, 4, 5].map((d) => (
                                        <Button
                                            key={d}
                                            variant={day === d ? "default" : "outline"}
                                            onClick={() => { setDay(d); alert(`Warped to Day ${d}`); }}
                                            className="border-slate-700 hover:bg-slate-800 hover:text-white"
                                        >
                                            Day {d}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={() => navigate('/game')} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4">
                                <ArrowRight className="w-4 h-4 mr-2" /> Return to Game
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Dangerous Zone */}
                    <div className="space-y-6">
                        <Card className="bg-red-950/10 border-red-900/30">
                            <CardHeader>
                                <CardTitle className="text-red-400 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5" />
                                    Danger Zone
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-slate-300">Global Leaderboard</h3>
                                    <p className="text-xs text-slate-500">Permanently delete all scores for all users.</p>
                                    <Button
                                        variant="destructive"
                                        onClick={handleClearLeaderboard}
                                        className="w-full bg-red-900/50 hover:bg-red-900 border border-red-800"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Nuke Leaderboard
                                    </Button>
                                </div>

                                <div className="h-px bg-red-900/30 my-4" />

                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-slate-300">Local Session</h3>
                                    <p className="text-xs text-slate-500">Wipe your local progress and restart.</p>
                                    <Button
                                        variant="outline"
                                        onClick={handleResetLocal}
                                        className="w-full border-red-800 text-red-400 hover:bg-red-950/50"
                                    >
                                        <Save className="w-4 h-4 mr-2" /> Reset My Progress
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
