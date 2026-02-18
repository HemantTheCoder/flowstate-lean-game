import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useGameStore } from '@/store/gameStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, Play, Calendar, User as UserIcon, LogOut, Award, BarChart3, Clock, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { UserProfile } from '@shared/schema';
import { format } from 'date-fns';
import { BADGES } from '@/data/badges';

export default function Profile() {
    const { user, logoutMutation, isLoading: isAuthLoading } = useAuth();
    const [, setLocation] = useLocation();
    const { importState } = useGameStore();

    const { data: profile, isLoading: isProfileLoading } = useQuery<UserProfile>({
        queryKey: ['/api/user/profile'],
        enabled: !!user,
    });

    if (isAuthLoading || isProfileLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!user) {
        setLocation('/');
        return null;
    }

    if (!profile) return null; // Should handle error state better ideally

    const { gameState, scores } = profile;

    const handleResume = async () => {
        if (gameState) {
            // Load state into store
            importState(gameState);
            setLocation('/game');
        }
    };

    const handleLogout = async () => {
        logoutMutation.mutate();
        setLocation('/');
    };

    // Calculate aggregate stats
    const totalScore = scores.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
    const bestPpc = Math.max(...scores.map(s => s.ppc || 0), 0);
    const completedChapters = scores.length;

    // get user join date
    const joinDate = user.createdAt ? new Date(user.createdAt) : new Date();

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-black border-4 border-indigo-50">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">{user.username}</h1>
                            <p className="text-slate-500 flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4" />
                                Member since {format(joinDate, 'MMMM yyyy')}
                            </p>
                            <div className="flex gap-2 mt-3">
                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                                    {user.role === 'admin' ? 'Administrator' : 'Architect'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setLocation('/')} className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Menu
                        </Button>
                        <Button variant="outline" onClick={handleLogout} className="text-slate-600 hover:text-red-600 hover:bg-red-50 border-slate-200">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Column: Stats & Resume */}
                    <div className="space-y-8">
                        {/* Current Game Card */}
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pb-6">
                                <CardTitle className="flex items-center gap-2">
                                    <Play className="w-5 h-5 fill-current" />
                                    Active Game
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {gameState ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Current Progress</p>
                                            <p className="text-2xl font-black text-slate-800">Chapter {gameState.chapter}</p>
                                            <p className="text-sm text-slate-600">Day {gameState.day}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Funds</span>
                                                <span className="font-mono font-bold">${gameState.resources?.budget?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Player Name</span>
                                                <span className="font-medium">{gameState.playerName}</span>
                                            </div>
                                        </div>
                                        <Button onClick={handleResume} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                                            Resume Game
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-slate-500 mb-4">No active save found.</p>
                                        <Button onClick={() => setLocation('/game')} variant="outline">Start New Game</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Aggregate Stats */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Career Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                                    <div className="text-2xl font-black text-slate-800">{totalScore.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Total Score</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                                    <div className="text-2xl font-black text-slate-800">{bestPpc}%</div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Best PPC</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <Award className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                                    <div className="text-2xl font-black text-slate-800">{completedChapters}</div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Chapters Done</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <Clock className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                    <div className="text-2xl font-black text-slate-800">{gameState ? Math.floor((Date.now() - new Date(gameState.lastPlayed || 0).getTime()) / (1000 * 60 * 60 * 24)) : 0}d</div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Since Last Play</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Badges & History */}
                    <div className="col-span-1 md:col-span-2 space-y-8">

                        {/* Achievements Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" />
                                Achievements
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {BADGES.map((badge) => {
                                    const isUnlocked = gameState?.unlockedBadges?.includes(badge.id);
                                    const Icon = badge.icon;

                                    return (
                                        <Card key={badge.id} className={`border-2 transition-all ${isUnlocked ? 'border-indigo-100 bg-white shadow-sm' : 'border-slate-100 bg-slate-50 opacity-60 grayscale'}`}>
                                            <CardContent className="p-4 flex flex-col items-center text-center gap-2 h-full justify-center">
                                                <div className={`p-3 rounded-full ${isUnlocked ? 'bg-indigo-50' : 'bg-slate-200'}`}>
                                                    <Icon className={`w-6 h-6 ${isUnlocked ? badge.color : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-sm ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>{badge.name}</h3>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{badge.description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Completion History */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-indigo-600" />
                                Completion History
                            </h2>

                            {scores.length > 0 ? (
                                <div className="grid gap-4">
                                    {scores.map((score) => (
                                        <Card key={score.id} className="border-slate-200 hover:shadow-md transition-shadow">
                                            <CardContent className="p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100">
                                                        {score.chapter}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">Chapter {score.chapter} Complete</h3>
                                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                            <Clock className="w-3 h-3" />
                                                            {score.completedAt ? new Date(score.completedAt).toLocaleDateString() : 'Unknown Date'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Efficiency</p>
                                                        <p className="font-mono font-bold text-slate-700">{score.efficiency}%</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">PPC</p>
                                                        <p className="font-mono font-bold text-slate-700">{score.ppc}%</p>
                                                    </div>
                                                    <div className="text-right pl-4 border-l border-slate-100">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Score</p>
                                                        <p className="font-mono font-black text-indigo-600 text-xl">{score.totalScore?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
                                    <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-slate-700">No History Yet</h3>
                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">Complete chapters to earn badges, set high scores, and track your construction management career!</p>
                                    <Button onClick={() => setLocation('/game')} variant="secondary">
                                        Play Now
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
