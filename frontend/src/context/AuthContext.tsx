"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    id: number;
    email: string;
    role: string;
    display_name?: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check local storage for token on mount
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        // Telegram WebApp Auto-Auth (Runs natively inside the Telegram app)
        if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
            const twa = (window as any).Telegram.WebApp;
            const tgUser = twa.initDataUnsafe?.user;

            // If initialized inside Telegram but no token in local storage, perform silent auto-login
            if (tgUser && !storedToken) {
                fetch("http://localhost:8000/api/auth/telegram", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: tgUser.id,
                        first_name: tgUser.first_name,
                        requested_role: "customer"
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.access_token) {
                            const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
                            const newUser = {
                                id: tokenPayload.user_id,
                                email: tokenPayload.sub,
                                role: tokenPayload.role,
                                display_name: tgUser.first_name
                            };
                            setToken(data.access_token);
                            setUser(newUser);
                            localStorage.setItem("token", data.access_token);
                            localStorage.setItem("user", JSON.stringify(newUser));
                        }
                    })
                    .catch(console.error);
            }
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
