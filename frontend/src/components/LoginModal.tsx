"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Store, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { t } = useLanguage();

    useEffect(() => {
        // Expose function to window for Telegram callback
        (window as any).onTelegramAuth = async (tgUser: any) => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:8000/api/auth/telegram", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...tgUser, requested_role: role }),
                });
                if (!res.ok) throw new Error("Telegram login failed");
                const data = await res.json();

                const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
                login(data.access_token, {
                    id: tokenPayload.user_id,
                    email: tokenPayload.sub,
                    role: tokenPayload.role
                });
                onClose();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const script = document.createElement("script");
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute("data-telegram-login", "WebigramBot"); // Must be a valid pre-registered TG bot
        script.setAttribute("data-size", "large");
        script.setAttribute("data-onauth", "onTelegramAuth(user)");
        script.setAttribute("data-request-access", "write");
        script.async = true;

        const container = document.getElementById("telegram-login-container");
        if (container) {
            container.innerHTML = "";
            container.appendChild(script);
        }
    }, [login, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const formData = new URLSearchParams();
                formData.append("username", email);
                formData.append("password", password);

                const res = await fetch("http://localhost:8000/api/auth/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData,
                });

                if (!res.ok) {
                    throw new Error("Invalid credentials");
                }

                const data = await res.json();

                // Parse JWT to get user info 
                const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));

                login(data.access_token, {
                    id: tokenPayload.user_id,
                    email: tokenPayload.sub,
                    role: tokenPayload.role
                });
                onClose();
            } else {
                // Register
                const res = await fetch(`http://localhost:8000/api/auth/register?role=${role}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || "Registration failed");
                }

                // Auto-login after registration
                setIsLogin(true);
                setError("Registration successful! Please log in.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleLogin = (selectedRole: string) => {
        setRole(selectedRole);
        const mockUser = {
            id: Math.floor(Math.random() * 100000),
            first_name: `Test_${selectedRole}`,
            requested_role: selectedRole
        };
        if (typeof (window as any).onTelegramAuth === 'function') {
            (window as any).onTelegramAuth(mockUser);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-white/95 backdrop-blur-xl w-full max-w-md p-8 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(44,89,64,0.4)] border border-primary/10 relative overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-secondary/30 text-primary hover:bg-accent hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-elegant text-foreground mb-2">
                                {t("welcome_back")}
                            </h2>
                            <p className="text-[11px] font-bold text-primary/60 uppercase tracking-[0.25em]">
                                {t("select_role")}
                            </p>
                        </div>

                        {error && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-medium border bg-red-50 text-red-700 border-red-200`}>
                                {error}
                            </div>
                        )}

                        <div className="mb-6 flex flex-col items-center">
                            <div className="flex flex-col gap-4 w-full mb-6">
                                <button
                                    onClick={() => handleRoleLogin("customer")}
                                    className="w-full relative group overflow-hidden rounded-2xl p-5 border border-primary/10 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-accent/40"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative flex items-center justify-between z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 group-hover:bg-accent group-hover:text-white">
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{t("buy")}</span>
                                                <span className="text-xs text-foreground/50 font-medium">Explore Market</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleRoleLogin("seller")}
                                    className="w-full relative group overflow-hidden rounded-2xl p-5 border border-primary/10 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-accent/40"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative flex items-center justify-between z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 group-hover:bg-accent group-hover:text-white">
                                                <Store className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{t("sell")}</span>
                                                <span className="text-xs text-foreground/50 font-medium">Manage Shop</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleRoleLogin("admin")}
                                    className="w-full relative group overflow-hidden rounded-2xl p-5 border border-primary/10 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-accent/40"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative flex items-center justify-between z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 group-hover:bg-accent group-hover:text-white">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{t("admin_role")}</span>
                                                <span className="text-xs text-foreground/50 font-medium">Control Panel</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Dev Telegram Override Hook is preserved invisibly or manually if needed, 
                                but the primary action is now built into the buttons to solve user confusion */}
                            <div id="telegram-login-container" className="hidden"></div>
                        </div>

                        <div className="mt-2 text-center text-[10px] font-medium text-foreground/40 uppercase tracking-widest space-y-1">
                            <p>{t("no_passwords")}</p>
                            <p>{t("secure_auth")}</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
