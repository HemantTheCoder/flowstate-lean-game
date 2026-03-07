import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameStore } from "@/store/gameStore";
import { InsertUser, User } from "@shared/schema";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
    loginMutation: any;
    logoutMutation: any;
    registerMutation: any;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const { data: user, isLoading, error } = useQuery<User | null>({
        queryKey: ["/api/user"],
        queryFn: async () => {
            const res = await fetch("/api/user");
            if (res.status === 401) return null;
            if (!res.ok) throw new Error("Failed to fetch user");
            return res.json();
        },
        retry: false,
        staleTime: Infinity,
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: Pick<InsertUser, "username" | "password">) => {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Login failed");
            }
            return res.json();
        },
        onSuccess: (user: User) => {
            queryClient.setQueryData(["/api/user"], user);
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (credentials: InsertUser) => {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Registration failed");
            }
            return res.json();
        },
        onSuccess: (user: User) => {
            queryClient.setQueryData(["/api/user"], user);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await fetch("/api/logout", { method: "POST" });
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/user"], null);
            // Completely wipe browser storage to prevent cross-account leak
            localStorage.removeItem('flowstate-storage');
            localStorage.removeItem('activeSessionId');
            localStorage.removeItem('flowstate_custom_tasks');
            // Force a hard reload to the home page to clear all React memory state
            window.location.href = '/';
        },
    });

    useEffect(() => {
        if (!user) return;

        // Ping presence immediately and then every 3 minutes
        fetch("/api/user/ping", { method: "POST" }).catch(console.error);
        const interval = setInterval(() => {
            fetch("/api/user/ping", { method: "POST" }).catch(console.error);
        }, 180000);

        return () => clearInterval(interval);
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user: user ?? null,
                isLoading,
                error: error as Error | null,
                loginMutation,
                logoutMutation,
                registerMutation,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
