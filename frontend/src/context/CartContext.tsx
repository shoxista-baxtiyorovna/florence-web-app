"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

export interface CartItem {
    id: number;
    title: string;
    title_uz?: string | null;
    title_ru?: string | null;
    description?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    price: number;
    category?: string;
    quantity: number;
    image_url: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, delta: number) => void;
    clearCart: () => void;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { language, t } = useLanguage();
    const [items, setItems] = useState<CartItem[]>([]);
    const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
    const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem("florence_cart");
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load cart");
            }
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("florence_cart", JSON.stringify(items));
        }
    }, [items, isMounted]);

    const addToCart = (product: Omit<CartItem, "quantity">) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        // Pinterest-style notification handling
        setLastAddedItem({ ...product, quantity: 1 });
        if (toastTimeout) clearTimeout(toastTimeout);
        const timeout = setTimeout(() => setLastAddedItem(null), 3500);
        setToastTimeout(timeout);
    };

    const removeFromCart = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQ = item.quantity + delta;
                    return { ...item, quantity: newQ > 0 ? newQ : 1 };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice }}>
            {children}

            {/* Pinterest-style global floating toast notification */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${lastAddedItem ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
                {lastAddedItem && (
                    <div className="bg-foreground text-background px-5 py-3.5 rounded-[30px] shadow-[0_10px_40px_rgba(0,0,0,0.25)] flex items-center gap-4 text-[13px] tracking-wide font-medium border border-white/10 min-w-[320px]">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-secondary/20 shadow-inner">
                            {lastAddedItem.image_url ? (
                                <img src={lastAddedItem.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="flex items-center justify-center w-full h-full text-secondary">❋</span>
                            )}
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-secondary tracking-widest text-[9px] uppercase font-bold">{t("added_to_cart") || "Added to cart"}</span>
                            <span className="truncate max-w-[160px] font-elegant text-[15px]">
                                {language === "uz" ? (lastAddedItem.title_uz || lastAddedItem.title) :
                                    language === "ru" ? (lastAddedItem.title_ru || lastAddedItem.title) :
                                        lastAddedItem.title}
                            </span>
                        </div>
                        <Link
                            href="/cart"
                            onClick={() => setLastAddedItem(null)}
                            className="ml-2 bg-accent text-white px-5 py-2 rounded-full text-[10px] hover:brightness-110 transition-colors uppercase font-bold tracking-widest shadow-sm border border-accent/20 cursor-pointer pointer-events-auto target-link"
                        >
                            View
                        </Link>
                    </div>
                )}
            </div>
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
};
