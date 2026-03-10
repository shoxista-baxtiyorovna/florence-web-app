"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Store, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LocationOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [city, setCity] = useState("Capital City");
    const { t } = useLanguage();

    useEffect(() => {
        // Allow opening manually via custom event
        const handleOpenOverlay = () => setIsOpen(true);
        window.addEventListener('openLocationOverlay', handleOpenOverlay);

        // Only show overlay once per session organically
        const hasSeenOverlay = sessionStorage.getItem("hasSeenOverlay");
        if (!hasSeenOverlay) {
            setIsOpen(true);
        }

        return () => window.removeEventListener('openLocationOverlay', handleOpenOverlay);
    }, []);

    const handleConfirm = (role: "buyer" | "seller") => {
        sessionStorage.setItem("hasSeenOverlay", "true");
        sessionStorage.setItem("userCity", city);
        sessionStorage.setItem("tempRole", role);
        setIsOpen(false);

        // Redirect sellers to the Bloom Dashboard onboarding
        if (role === "seller") {
            window.location.href = "/seller";
        } else {
            window.location.reload();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        // Petal-shape inspired rounded corners
                        className="bg-card-bg p-8 sm:p-12 shadow-2xl max-w-lg w-full mx-4 border border-border relative overflow-hidden text-center"
                        style={{ borderRadius: "40px" }}
                    >
                        {/* Decorative organic background shape */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                        <MapPin className="h-16 w-16 text-primary mx-auto mb-6" />
                        <h2 className="text-3xl font-bold mb-2 text-foreground">
                            Welcome to Bloom Market
                        </h2>
                        <p className="text-foreground/70 mb-8">
                            Where are we delivering today?
                        </p>

                        <div className="mb-8">
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full p-4 rounded-2xl border border-border bg-secondary/20 text-foreground font-medium text-lg outline-none focus:ring-2 focus:ring-primary transition-all"
                            >
                                <option value="Capital City">Capital City</option>
                                <option value="Samarkand">Samarkand</option>
                                <option value="Bukhara">Bukhara</option>
                                <option value="Andijan">Andijan</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleConfirm("buyer")}
                                className="flex flex-col items-center justify-center p-4 bg-secondary/10 hover:bg-secondary/30 border border-border rounded-tl-[30px] rounded-br-[30px] rounded-tr-[10px] rounded-bl-[10px] transition-all group"
                            >
                                <User className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold">I'm Buying</span>
                                <span className="text-xs text-foreground/60 mt-1">Shop local flowers</span>
                            </button>

                            <button
                                onClick={() => handleConfirm("seller")}
                                className="flex flex-col items-center justify-center p-4 bg-secondary/10 hover:bg-secondary/30 border border-border rounded-tr-[30px] rounded-bl-[30px] rounded-tl-[10px] rounded-br-[10px] transition-all group"
                            >
                                <Store className="h-8 w-8 text-accent mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold">I'm Selling</span>
                                <span className="text-xs text-foreground/60 mt-1">Open your shop</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
