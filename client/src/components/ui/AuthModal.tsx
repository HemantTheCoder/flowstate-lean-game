import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
    triggerOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AuthModal({ triggerOpen, onOpenChange }: AuthModalProps = {}) {
    const { user, loginMutation, registerMutation, logoutMutation } = useAuth();
    const { toast } = useToast();
    const [internalOpen, setInternalOpen] = useState(false);

    const isOpen = onOpenChange ? (triggerOpen ?? false) : internalOpen;
    const setIsOpen = onOpenChange ? onOpenChange : setInternalOpen;

    // Form State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ username, password }, {
            onSuccess: () => {
                setIsOpen(false);
                toast({ title: "Welcome back!", description: "You are now logged in." });
            },
            onError: (error: Error) => {
                toast({ title: "Login failed", description: error.message, variant: "destructive" });
            }
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate({ username, password }, {
            onSuccess: () => {
                setIsOpen(false);
                toast({ title: "Account created!", description: "You are now logged in." });
            },
            onError: (error: Error) => {
                toast({ title: "Registration failed", description: error.message, variant: "destructive" });
            }
        });
    };

    const handleLogout = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: () => {
                toast({ title: "Logged out", description: "Your session has ended." });
            }
        });
    };

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600">
                    Hello, {user.username}
                </span>
                <a href="/profile">
                    <Button variant="outline" size="sm" className="mr-2">
                        View Profile
                    </Button>
                </a>
                <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
                    {logoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {!onOpenChange && (
                <DialogTrigger asChild>
                    <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        Login / Save Progress
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>FlowState Account</DialogTitle>
                    <DialogDescription>
                        Login or create an account to save your progress to the cloud and play across devices.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                                {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
