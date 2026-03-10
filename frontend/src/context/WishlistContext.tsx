"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

import Link from "next/link";
import { useLanguage } from "./LanguageContext";

interface WishlistContextType {
    likedProductIds: Set<number>;
    toggleLike: (product: any) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { token, isAuthenticated } = useAuth();
    const { language, t } = useLanguage();
    const [likedProductIds, setLikedProductIds] = useState<Set<number>>(new Set());
    const [lastLikedItem, setLastLikedItem] = useState<any | null>(null);
    const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);

    // Fetch or load local wishlist
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchWishlist();
        } else {
            const local = localStorage.getItem("florence_wishlist");
            if (local) {
                try {
                    setLikedProductIds(new Set(JSON.parse(local)));
                } catch (e) {
                    console.error("Failed to parse local wishlist");
                }
            } else {
                setLikedProductIds(new Set()); // Clear if logged out and no local
            }
        }
    }, [isAuthenticated, token]);

    const fetchWishlist = async () => {
        if (!token) return;
        try {
            const res = await fetch("http://localhost:8000/api/auth/wishlist", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const ids = new Set<number>(data.map((p: any) => p.id));
                setLikedProductIds(ids);
                // Also optionally save retrieved ids to local storage so they persist on logout
                localStorage.setItem("florence_wishlist", JSON.stringify(Array.from(ids)));
            }
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        }
    };

    const toggleLike = async (product: any) => {
        const productId = product.id;
        // Optimistic UI update
        let isNowLiked = false;
        setLikedProductIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
                isNowLiked = true;
            }

            // Persist to local storage synchronously for Guest users
            localStorage.setItem("florence_wishlist", JSON.stringify(Array.from(newSet)));
            return newSet;
        });

        if (isNowLiked) {
            setLastLikedItem(product);
            if (toastTimeout) clearTimeout(toastTimeout);
            const timeout = setTimeout(() => setLastLikedItem(null), 3500);
            setToastTimeout(timeout);
        }

        // Sync with backend if logged in
        if (isAuthenticated && token) {
            try {
                const res = await fetch(`http://localhost:8000/api/products/${productId}/like`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!res.ok) {
                    // Revert if API failed
                    console.error("Failed to sync like with backend");
                    fetchWishlist();
                }
            } catch (error) {
                console.error("Network error syncing like", error);
                fetchWishlist();
            }
        }
    };

    return (
        <WishlistContext.Provider value={{ likedProductIds, toggleLike }}>
            {children}

            {/* Pinterest-style global floating toast notification for Wishlist */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${lastLikedItem ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
                {lastLikedItem && (
                    <div className="bg-foreground text-background px-5 py-3.5 rounded-[30px] shadow-[0_10px_40px_rgba(0,0,0,0.25)] flex items-center gap-4 text-[13px] tracking-wide font-medium border border-white/10 min-w-[320px]">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-secondary/20 shadow-inner">
                            {lastLikedItem.image_url ? (
                                <img src={lastLikedItem.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="flex items-center justify-center w-full h-full text-secondary">❋</span>
                            )}
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-secondary tracking-widest text-[9px] uppercase font-bold">{t("added_to_wishlist") || "Added to wishlist"}</span>
                            <span className="truncate max-w-[160px] font-elegant text-[15px]">
                                {language === "uz" ? (lastLikedItem.title_uz || lastLikedItem.title) :
                                    language === "ru" ? (lastLikedItem.title_ru || lastLikedItem.title) :
                                        lastLikedItem.title}
                            </span>
                        </div>
                        <Link
                            href={`/products/${lastLikedItem.id}`}
                            onClick={() => setLastLikedItem(null)}
                            className="ml-2 bg-accent text-white px-5 py-2 rounded-full text-[10px] hover:brightness-110 transition-colors uppercase font-bold tracking-widest shadow-sm border border-accent/20 cursor-pointer pointer-events-auto target-link"
                        >
                            {t("view") || "VIEW"}
                        </Link>
                    </div>
                )}
            </div>
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
};
