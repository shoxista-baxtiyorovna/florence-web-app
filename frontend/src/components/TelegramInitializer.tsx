"use client";
import { useEffect } from "react";

export default function TelegramInitializer() {
    useEffect(() => {
        // Automatically inject and initialize the Telegram WebApp SDK bindings
        if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
            const twa = (window as any).Telegram.WebApp;

            // Wait for WebApp to be fully ready
            twa.ready();

            // Expand to maximum available height
            twa.expand();

            // Enforce Florence Beige aesthetic instead of Telegram default themes
            twa.setHeaderColor("#F4F1ED"); // Match bg-background
            twa.setBackgroundColor("#F4F1ED");
        }
    }, []);

    return null;
}
