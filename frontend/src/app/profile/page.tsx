"use client";
import React, { useState, useEffect } from "react";
import { User, MapPin, Package, Heart, MessageSquare, CheckCircle, Smartphone, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

import { useLanguage } from "@/context/LanguageContext";

export default function BuyerProfile() {
    const { user, token } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState("details");
    const [phone, setPhone] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [code, setCode] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    const [displayName, setDisplayName] = useState(user?.display_name || "");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || "");
        }
    }, [user]);

    if (!user) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-elegant mb-4">{t("welcome_back")}</h1>
            <p className="text-foreground/60 mb-8">{t("secure_auth")}</p>
        </div>
    );

    const handleVerifyPhone = () => {
        if (!phone) return;
        setIsVerifying(true);
    };

    const handleConfirmCode = () => {
        if (code === "1234") {
            setIsVerified(true);
            setIsVerifying(false);
        } else {
            alert("Invalid code. Use 1234.");
        }
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/auth/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ display_name: displayName })
            });
            if (res.ok) {
                alert("Profile updated successfully!");
            } else {
                alert("Failed to update profile.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (activeTab === "orders" && token) {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/api/orders/", {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(err => console.error(err));
        }
    }, [activeTab, token]);

    const handleCancelOrder = async (orderId: number) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                // Update local status to cancelled
                setOrders(current => current.map(o => o.id === orderId ? { ...o, payment_status: "cancelled" } : o));
                alert("Order cancelled successfully.");
            } else {
                const errData = await res.json();
                alert(errData.detail || "Failed to cancel order.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 bg-background max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 rounded-full hover:bg-secondary/20 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-4xl font-extrabold text-foreground">{t("my_profile")}</h1>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-2">
                    <button onClick={() => setActiveTab("details")} className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "details" ? "bg-primary text-white" : "hover:bg-secondary/20"}`}>
                        <User className="w-5 h-5" /> {t("details")}
                    </button>
                    <button onClick={() => setActiveTab("orders")} className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "orders" ? "bg-primary text-white" : "hover:bg-secondary/20"}`}>
                        <Package className="w-5 h-5" /> {t("orders")}
                    </button>
                    <button onClick={() => setActiveTab("address")} className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "address" ? "bg-primary text-white" : "hover:bg-secondary/20"}`}>
                        <MapPin className="w-5 h-5" /> {t("address_book")}
                    </button>
                    <button onClick={() => setActiveTab("favorites")} className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "favorites" ? "bg-primary text-white" : "hover:bg-secondary/20"}`}>
                        <Heart className="w-5 h-5" /> {t("followed_shops")}
                    </button>
                    <button onClick={() => setActiveTab("reviews")} className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === "reviews" ? "bg-primary text-white" : "hover:bg-secondary/20"}`}>
                        <MessageSquare className="w-5 h-5" /> {t("my_reviews")}
                    </button>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3 bg-card-bg p-8 rounded-3xl shadow-sm border border-border min-h-[500px]">
                    {activeTab === "details" && (
                        <div className="space-y-6 max-w-md">
                            <h2 className="text-2xl font-bold mb-4">{t("account_details")}</h2>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="text" disabled value={user.email} className="w-full p-3 rounded-xl border border-border bg-background/50 text-foreground/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t("display_name")}</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="FlowerLover99"
                                    className="w-full p-3 rounded-xl border border-border bg-background focus:border-primary outline-none transition-colors"
                                />
                            </div>

                            <hr className="my-6 border-border" />

                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-primary" /> {t("phone_verification")}
                            </h3>
                            {isVerified ? (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-xl border border-green-200">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-bold">{t("phone_verified")}</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-foreground/70">{t("phone_req")}</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="tel"
                                            placeholder="+998 90 123 45 67"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="flex-1 p-3 rounded-xl border border-border bg-background focus:border-primary outline-none"
                                        />
                                        <button onClick={handleVerifyPhone} className="bg-secondary text-foreground font-bold px-6 rounded-xl hover:bg-primary hover:text-white transition-colors">
                                            {t("send_sms")}
                                        </button>
                                    </div>

                                    {isVerifying && (
                                        <div className="p-4 border border-primary/30 bg-primary/5 rounded-xl space-y-3 mt-4">
                                            <p className="text-sm font-medium">{t("enter_code")}</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    maxLength={4}
                                                    value={code}
                                                    onChange={(e) => setCode(e.target.value)}
                                                    className="w-32 p-3 text-center tracking-widest font-bold rounded-xl border border-border bg-background focus:border-primary outline-none"
                                                />
                                                <button onClick={handleConfirmCode} className="bg-primary text-white font-bold px-6 rounded-xl hover:bg-accent transition-colors">
                                                    {t("confirm")}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleUpdateProfile}
                                disabled={isUpdating}
                                className="w-full bg-primary text-white font-bold py-3 mt-8 rounded-petal hover:bg-accent hover:scale-[1.02] shadow-sm transition-all duration-300 disabled:opacity-50"
                            >
                                {isUpdating ? t("saving") : t("save_profile_changes")}
                            </button>
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">{t("order_history")}</h2>
                            {orders.length === 0 ? (
                                <div className="p-8 border-2 border-dashed border-border rounded-3xl text-center text-foreground/50">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{t("no_orders")}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order.id} className="p-5 border border-border rounded-2xl bg-background/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div>
                                                <p className="font-bold text-lg">{t("orders")} #{order.id}</p>
                                                <p className="text-sm text-foreground/70">
                                                    {t("date")}: {new Date(order.created_at).toLocaleDateString()} • {t("amount")}: ${order.total_amount.toFixed(2)}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.payment_status === "cancelled" ? "bg-red-100 text-red-700" : order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                        {order.payment_status.toUpperCase()}
                                                    </span>
                                                    {order.transaction_id && <span className="text-xs text-foreground/50 font-mono">ID: {order.transaction_id.slice(0, 8)}...</span>}
                                                </div>
                                            </div>

                                            {order.payment_status === "pending" && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="px-4 py-2 border-2 border-red-500 text-red-500 font-bold rounded-petal hover:bg-red-500 hover:text-white transition-colors"
                                                >
                                                    {t("cancel_order")}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "address" && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">{t("address_book")}</h2>
                            <div className="p-8 border-2 border-dashed border-border rounded-3xl text-center text-foreground/50">
                                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>{t("no_addresses")}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "favorites" && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">{t("followed_shops")}</h2>
                            <div className="p-8 border-2 border-dashed border-border rounded-3xl text-center text-foreground/50">
                                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>{t("no_favorites")}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">{t("my_reviews_title")}</h2>
                            <p className="text-sm text-foreground/70 mb-4">{t("reviews_desc")}</p>
                            <div className="p-8 border-2 border-dashed border-border rounded-3xl text-center text-foreground/50">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>{t("no_reviews")}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
