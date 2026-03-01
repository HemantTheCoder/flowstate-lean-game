import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useGameStore } from '@/store/gameStore';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShieldAlert, Trash2, ArrowRight, Save, LayoutDashboard, MessageSquare, Users, Clock, Activity, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function DevDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'metrics' | 'players' | 'feedbacks'>('metrics');
    const [feedbackTab, setFeedbackTab] = useState<'open' | 'resolved'>('open');
    const [, setLocation] = useLocation();
    const { toast } = useToast();
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

    const { data: feedbacks, isLoading: isLoadingFeedback } = useQuery<any[]>({
        queryKey: ['/api/feedback'],
        enabled: isAuthenticated
    });

    const { data: registeredUsers, isLoading: isLoadingUsers } = useQuery<any[]>({
        queryKey: ['/api/admin/users'],
        enabled: isAuthenticated
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            if (!confirm("⚠️ Are you sure you want to permanently delete this user and all their game data?")) {
                throw new Error("Cancelled list deletion");
            }
            await apiRequest('DELETE', `/api/admin/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
            toast({ title: "User Deleted", description: "The player account has been completely removed." });
        },
        onError: (err: Error) => {
            if (err.message !== "Cancelled list deletion") {
                toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
            }
        }
    });

    // Resolve Feedback Mutation
    const resolveFeedbackMutation = useMutation({
        mutationFn: async (id: number) => {
            if (!confirm("Resolve and archive this feedback report?")) {
                throw new Error("Cancelled feedback resolution");
            }
            await apiRequest('PATCH', `/api/feedback/${id}/resolve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
            toast({ title: "Feedback Resolved", description: "The report has been archived." });
        },
        onError: (err: Error) => {
            if (err.message !== "Cancelled feedback resolution") {
                toast({ title: "Error", description: "Failed to resolve feedback", variant: "destructive" });
            }
        }
    });

    // Delete Feedback Mutation (Permanent)
    const deleteFeedbackMutation = useMutation({
        mutationFn: async (id: number) => {
            if (!confirm("⚠️ Permanently delete this feedback report?")) {
                throw new Error("Cancelled feedback deletion");
            }
            await apiRequest('DELETE', `/api/feedback/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
            toast({ title: "Feedback Deleted", description: "The report has been permanently removed." });
        },
        onError: (err: Error) => {
            if (err.message !== "Cancelled feedback deletion") {
                toast({ title: "Error", description: "Failed to delete feedback", variant: "destructive" });
            }
        }
    });

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
                    <div className="flex gap-4">
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500" />
                            Users: <span className="text-white font-bold">{registeredUsers?.length || 0}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-cyan-500" />
                            Feedbacks: <span className="text-white font-bold">{feedbacks?.length || 0}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                            Session: <span className="text-emerald-500 font-bold">Active Administraiton</span>
                        </div>
                    </div>
                </header>

                <div className="flex flex-wrap gap-2 mb-6">
                    <Button
                        variant={activeTab === 'metrics' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('metrics')}
                        className={`font-bold tracking-widest uppercase ${activeTab === 'metrics' ? 'bg-indigo-600' : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        Game Metrics
                    </Button>
                    <Button
                        variant={activeTab === 'players' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('players')}
                        className={`font-bold tracking-widest uppercase ${activeTab === 'players' ? 'bg-indigo-600' : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <Users className="w-4 h-4 mr-2" /> Player Directory
                    </Button>
                    <Button
                        variant={activeTab === 'feedbacks' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('feedbacks')}
                        className={`font-bold tracking-widest uppercase ${activeTab === 'feedbacks' ? 'bg-indigo-600' : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <MessageSquare className="w-4 h-4 mr-2" /> Feedback Reports
                    </Button>
                </div>

                {activeTab === 'metrics' && (
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
                                    <label className="text-sm font-medium text-slate-400">Chapters</label>
                                    <div className="space-y-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                useGameStore.getState().unlockAllChapters();
                                                alert('All Chapters Unlocked!');
                                            }}
                                            className="w-full border-green-800 text-green-400 hover:bg-green-950/50"
                                        >
                                            <ShieldAlert className="w-4 h-4 mr-2" /> Unlock All Chapters
                                        </Button>

                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3].map((c) => (
                                                <Button
                                                    key={c}
                                                    variant={chapter === c ? "default" : "outline"}
                                                    onClick={() => {
                                                        setChapter(c);
                                                        alert(`Warped to Chapter ${c}`);
                                                    }}
                                                    className={`border-slate-700 hover:bg-slate-800 hover:text-white ${chapter === c ? 'bg-indigo-600' : ''}`}
                                                >
                                                    Ch {c}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <Button onClick={() => navigate('/game')} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                        <ArrowRight className="w-4 h-4 mr-2" /> Return to Game
                                    </Button>
                                    <Button onClick={() => navigate('/')} variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                        <ArrowRight className="w-4 h-4 mr-2" /> Return to Home Page
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Database Tools */}
                        <div className="space-y-6">
                            <Card className="bg-slate-900 border-indigo-900/30">
                                <CardHeader>
                                    <CardTitle className="text-indigo-400 flex items-center gap-2">
                                        <Save className="w-5 h-5" />
                                        Database Tools
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-slate-300">Test Connectivity</h3>
                                        <p className="text-xs text-slate-500">Insert a dummy record to verify DB connection.</p>
                                        <Button
                                            variant="outline"
                                            onClick={async () => {
                                                try {
                                                    await apiRequest('POST', '/api/leaderboard', {
                                                        playerName: 'Neon Tester',
                                                        chapter: 1,
                                                        efficiency: 100,
                                                        ppc: 100,
                                                        quizScore: 10,
                                                        totalScore: 999
                                                    });
                                                    await queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
                                                    alert('✅ Test record added to Neon DB!');
                                                } catch (e) {
                                                    alert('❌ Failed to add record. Check console.');
                                                    console.error(e);
                                                }
                                            }}
                                            className="w-full border-indigo-800 text-indigo-400 hover:bg-indigo-950/50"
                                        >
                                            <Save className="w-4 h-4 mr-2" /> Seed Test Score
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

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
                )}

                {/* Player Directory Tab */}
                {activeTab === 'players' && (
                    <Card className="bg-slate-900 border-indigo-900/30 w-full animate-in fade-in zoom-in duration-300">
                        <CardHeader>
                            <CardTitle className="text-indigo-400 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Registered Player Directory
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {isLoadingUsers ? (
                                    <div className="text-slate-500 animate-pulse flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading players...</div>
                                ) : !registeredUsers || registeredUsers.length === 0 ? (
                                    <div className="text-slate-500 border border-slate-800 p-8 rounded-xl text-center">No registered players yet.</div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                                        <table className="w-full text-left text-sm text-slate-300">
                                            <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                                                <tr>
                                                    <th className="px-6 py-4 font-bold tracking-widest">Player</th>
                                                    <th className="px-6 py-4 font-bold tracking-widest">Status</th>
                                                    <th className="px-6 py-4 font-bold tracking-widest">Joined</th>
                                                    <th className="px-6 py-4 font-bold tracking-widest">Last Active</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {registeredUsers.map((u: any) => {
                                                    // Determine if online (played in last 15 mins)
                                                    const isOnline = u.lastPlayed && (new Date().getTime() - new Date(u.lastPlayed).getTime() < 15 * 60 * 1000);

                                                    return (
                                                        <tr key={u.id} className="border-b border-slate-800/50 bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-white flex items-center gap-2">
                                                                    {u.username}
                                                                    {u.role === 'admin' && <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-2 py-0.5 rounded uppercase tracking-widest border border-indigo-500/30">ADMIN</span>}
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-1">ID: {u.id}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {isOnline ? (
                                                                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded w-fit border border-emerald-500/20">
                                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online Now
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                                                                        <Clock className="w-3 h-3" /> Offline
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                                                                {new Date(u.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                                                                {u.lastPlayed ? new Date(u.lastPlayed).toLocaleString() : 'Never'}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => deleteUserMutation.mutate(u.id)}
                                                                    disabled={deleteUserMutation.isPending || u.role === 'admin'}
                                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30"
                                                                >
                                                                    {deleteUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Feedback Reports Tab */}
                {activeTab === 'feedbacks' && (
                    <Card className="bg-slate-900 border-cyan-900/30 w-full animate-in fade-in zoom-in duration-300">
                        <CardHeader>
                            <CardTitle className="text-cyan-400 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Player Feedback & Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-4">
                                    <Button
                                        variant={feedbackTab === 'open' ? 'default' : 'ghost'}
                                        onClick={() => setFeedbackTab('open')}
                                        className={`h-8 ${feedbackTab === 'open' ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-300'}`}
                                    >
                                        Open Reports {feedbacks ? `(${feedbacks.filter((f: any) => f.status === 'open').length})` : ''}
                                    </Button>
                                    <Button
                                        variant={feedbackTab === 'resolved' ? 'default' : 'ghost'}
                                        onClick={() => setFeedbackTab('resolved')}
                                        className={`h-8 ${feedbackTab === 'resolved' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-300'}`}
                                    >
                                        Resolved {feedbacks ? `(${feedbacks.filter((f: any) => f.status === 'resolved').length})` : ''}
                                    </Button>
                                </div>
                                {isLoadingFeedback ? (
                                    <div className="text-slate-500 animate-pulse">Loading reports...</div>
                                ) : !feedbacks || feedbacks.filter((f: any) => f.status === feedbackTab).length === 0 ? (
                                    <div className="text-slate-500 border border-slate-800 p-8 rounded-xl text-center">No {feedbackTab} reports found.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {feedbacks.filter((f: any) => f.status === feedbackTab).map((fb: any) => (
                                            <div key={fb.id} className={`p-4 rounded-xl border ${feedbackTab === 'resolved' ? 'bg-slate-900/50 border-emerald-900/30' : 'bg-slate-950 border-slate-800'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${fb.type === 'bug' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                            fb.type === 'suggestion' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                                                                'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                                            }`}>
                                                            {fb.type}
                                                        </span>
                                                        <span className="text-slate-300 font-bold text-sm">
                                                            {fb.playerName}
                                                            {fb.email && <span className="text-slate-500 ml-2 font-normal">({fb.email})</span>}
                                                            {fb.user && (
                                                                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                                    Registered User: {fb.user.username}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-slate-500 text-xs">{new Date(fb.createdAt).toLocaleDateString()}</span>
                                                        {feedbackTab === 'open' ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => resolveFeedbackMutation.mutate(fb.id)}
                                                                disabled={resolveFeedbackMutation.isPending}
                                                                className="h-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                            >
                                                                {resolveFeedbackMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Resolve</span>}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteFeedbackMutation.mutate(fb.id)}
                                                                disabled={deleteFeedbackMutation.isPending}
                                                                className="h-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                            >
                                                                {deleteFeedbackMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete</span>}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 text-sm whitespace-pre-wrap">{fb.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
