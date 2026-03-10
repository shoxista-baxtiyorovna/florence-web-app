"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
    const { t, language } = useLanguage();
    const { token } = useAuth();

    const [mounted, setMounted] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("payme");

    // Gifting Suite State
    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [giftMessage, setGiftMessage] = useState("");
    const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("Morning");

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleCheckout = async () => {
        if (!token) {
            alert(t("login_required") || "Please login to checkout.");
            return;
        }

        setIsCheckingOut(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/orders/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    branch_id: 1, // Mock branch MVP
                    items: items.map(item => ({ product_id: item.id, quantity: item.quantity })),
                    recipient_name: recipientName || null,
                    recipient_phone: recipientPhone || null,
                    is_anonymous: isAnonymous,
                    gift_message: giftMessage || null,
                    delivery_time_slot: deliveryTimeSlot || null
                })
            });

            if (!res.ok) throw new Error("Checkout failed");

            setCheckoutSuccess(true);
            clearCart();
            setTimeout(() => setCheckoutSuccess(false), 3000);
        } catch (error) {
            console.error("Order error", error);
            alert("Checkout failed. Please try again.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-foreground mb-8 border-b border-border pb-4">
                    {t("cart")}
                </h1>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-card-bg rounded-2xl shadow-sm border border-border">
                        <span className="text-6xl mb-4 block">🌸</span>
                        <h2 className="text-2xl font-medium text-foreground mb-4">{t("empty_cart")}</h2>
                        <Link
                            href="/"
                            className="inline-block bg-red-600 text-white font-bold px-8 py-3 rounded-full hover:bg-red-700 transition-colors shadow-md"
                        >
                            {t("shop_now")}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
                            {items.map((item, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={item.id}
                                    className="bg-card-bg p-4 rounded-xl border border-border/50 shadow-sm flex gap-4 items-center"
                                >
                                    <div className="w-20 h-20 bg-secondary/20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-2xl">🌿</span>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-foreground">
                                            {language === 'uz' ? (item.title_uz || item.title) :
                                                language === 'ru' ? (item.title_ru || item.title) :
                                                    item.title}
                                        </h3>
                                        <p className="text-accent font-semibold">${item.price.toFixed(2)}</p>
                                        <p className="text-xs text-foreground/50 mt-1">From: Bloom Shop Vendor</p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-secondary/10 px-3 py-1 rounded-full border border-border">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="text-foreground/70 hover:text-primary transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="font-medium w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="text-foreground/70 hover:text-primary transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-foreground/40 hover:text-primary transition-colors ml-2"
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-card-bg p-6 rounded-2xl shadow-sm border border-border">
                                <h3 className="text-xl font-elegant mb-4 text-foreground">{t("gifting_suite")}</h3>

                                <div className="space-y-4 mb-4">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-bold text-foreground/60 mb-2">{t("recipient_name")}</label>
                                        <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="E.g. Malika" className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:border-accent text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-bold text-foreground/60 mb-2">{t("recipient_phone")}</label>
                                        <input type="tel" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} placeholder="+998 90 123 45 67" className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:border-accent text-sm" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="anonymous" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="w-4 h-4 accent-accent" />
                                        <label htmlFor="anonymous" className="text-sm font-medium text-foreground/80">{t("deliver_anonymously")}</label>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-bold text-foreground/60 mb-2">{t("gift_message")}</label>
                                        <textarea value={giftMessage} onChange={e => setGiftMessage(e.target.value)} placeholder="..." rows={2} className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:border-accent text-sm resize-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest font-bold text-foreground/60 mb-2">{t("delivery_time_slot")}</label>
                                        <select value={deliveryTimeSlot} onChange={e => setDeliveryTimeSlot(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background outline-none focus:border-accent text-sm">
                                            <option value="Morning">{t("morning")}</option>
                                            <option value="Afternoon">{t("afternoon")}</option>
                                            <option value="Evening">{t("evening")}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card-bg p-6 rounded-2xl shadow-sm border border-border">
                                <h3 className="text-xl font-elegant mb-4 text-foreground">{t("delivery_estimate")}</h3>
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground/70">{t("distance")}</span>
                                        <span className="font-medium">4.2 km</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-foreground/70">{t("time_to_deliver")}</span>
                                        <span className="font-medium text-accent">~31 mins</span>
                                    </div>
                                </div>
                                {/* Dynamically loaded Map Component Placeholder */}
                                <div
                                    onClick={() => setShowMap(!showMap)}
                                    className="h-32 bg-secondary/20 rounded-xl flex items-center justify-center border border-border mb-2 overflow-hidden relative group cursor-pointer transition-all"
                                >
                                    {showMap ? (
                                        <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
                                            <span className="text-3xl mb-1">📍</span>
                                            <span className="text-xs font-bold text-center">Interactive Map Active<br />(Leaflet Mock)</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 transition-all">
                                                <span className="text-white font-bold text-sm">{t("view_live_map")}</span>
                                            </div>
                                            <span className="text-2xl">🗺️</span> <span className="ml-2 font-medium text-sm text-foreground/50">{t("view_live_map")}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-card-bg p-6 rounded-2xl shadow-md border border-border sticky top-24">
                                <h3 className="text-xl font-bold mb-4">{t("total")}</h3>

                                <div className="space-y-3 mb-6 text-sm border-b border-border pb-4">
                                    <div className="flex justify-between text-foreground/70">
                                        <span>{t("items_subtotal")}</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-foreground/70">
                                        <span>{t("dynamic_fee")}</span>
                                        <span>$4.20</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6 text-2xl font-extrabold text-accent border-b border-border pb-4">
                                    <span>${(totalPrice + 4.2).toFixed(2)}</span>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold mb-2">{t("payment_method")}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setPaymentMethod("payme")}
                                            className={`py-2 border-2 rounded-xl font-bold transition-all flex items-center justify-center ${paymentMethod === "payme" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground/70 hover:bg-secondary/20"
                                                }`}
                                        >
                                            Payme
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod("uzum")}
                                            className={`py-2 border-2 rounded-xl font-bold transition-all flex items-center justify-center ${paymentMethod === "uzum" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground/70 hover:bg-secondary/20"
                                                }`}
                                        >
                                            Uzum
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className={`w-full py-4 font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 group rounded-tl-[30px] rounded-br-[30px] rounded-tr-[10px] rounded-bl-[10px] ${checkoutSuccess ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                                        } disabled:opacity-75 relative`}
                                >
                                    {isCheckingOut ? t("processing") : checkoutSuccess ? `✓ ${t("checkout_success")}` : t("checkout")}
                                    {!isCheckingOut && !checkoutSuccess && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
