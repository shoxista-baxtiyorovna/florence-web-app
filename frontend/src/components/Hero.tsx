"use client";
import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
    const { t } = useLanguage();

    return (
        <div className="relative w-full overflow-hidden bg-background min-h-[600px] flex items-center font-sans tracking-tight">

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">

                {/* Text Content */}
                <div className="pt-20 pb-24 md:pl-12">
                    <motion.h1
                        className="text-5xl md:text-[5.5rem] font-elegant mb-8 leading-[1.05] tracking-tight text-foreground"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Florence <br />
                        <span className="text-primary italic">Botanicals</span>
                    </motion.h1>

                    <motion.ul
                        className="text-lg md:text-[22px] text-foreground/80 mb-14 space-y-4 font-light tracking-wide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <li className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent block shadow-[0_0_8px_rgba(216,155,155,0.8)]"></span>
                            <span>{t("hero_subtitle")}</span>
                        </li>
                    </motion.ul>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-accent text-white px-[44px] py-[22px] rounded-petal tracking-[0.15em] text-[13px] hover:brightness-110 shadow-xl transition-all font-bold"
                    >
                        {t("shop_now")}
                    </motion.button>
                </div>

                {/* Hero Image */}
                <div className="relative h-full w-full flex justify-center md:justify-end items-center">
                    <motion.img
                        src="/roses.png"
                        alt="White Roses Bouquet"
                        className="w-[120%] max-w-none md:w-[150%] h-auto object-contain translate-x-4 md:translate-x-12 translate-y-12 drop-shadow-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />

                    {/* Floating Petals matching the organic feel of the screenshot */}
                    <motion.div className="absolute top-[20%] right-[80%] w-6 h-4 bg-white/40 rounded-full blur-[1px] rotate-45 shadow-lg" animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ borderTopLeftRadius: '100%', borderBottomRightRadius: '100%' }} />
                    <motion.div className="absolute bottom-[20%] right-[20%] w-5 h-3 bg-secondary/80 rounded-full blur-[1px] -rotate-12 shadow-sm" animate={{ y: [0, 30, 0], x: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} style={{ borderTopLeftRadius: '100%', borderBottomRightRadius: '100%' }} />
                    <motion.div className="absolute top-[40%] right-[10%] w-4 h-3 bg-accent/60 rounded-full blur-[1px] rotate-12" animate={{ y: [0, -15, 0], rotate: [0, 45, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} style={{ borderTopLeftRadius: '100%', borderBottomRightRadius: '100%' }} />
                </div>
            </div>

        </div>
    );
}
