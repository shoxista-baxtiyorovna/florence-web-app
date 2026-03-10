"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function SellerDashboard() {
    const { t } = useLanguage();
    const { token, isAuthenticated } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState("onboarding");
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingBranch, setIsAddingBranch] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [branchSuccess, setBranchSuccess] = useState(false);
    const [error, setError] = useState("");

    // Data State
    const [shopId, setShopId] = useState<number | null>(null);
    const [businessName, setBusinessName] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [branches, setBranches] = useState<any[]>([]);
    const [badge, setBadge] = useState("Seed");

    // New Branch State
    const [newCity, setNewCity] = useState("");
    const [newAddress, setNewAddress] = useState("");

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchShop = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/shops/", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const shop = data[0];
                        setShopId(shop.id);
                        setBusinessName(shop.business_name);
                        setRegistrationNumber(shop.registration_number || "");
                        setBranches(shop.branches || []);
                        setBadge(shop.badge);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch shop details", err);
            }
        };

        fetchShop();
    }, [isAuthenticated, token]);

    const handleSaveProfile = async () => {
        if (!businessName) return setError("Business name is required.");
        setError("");
        setIsSaving(true);

        try {
            const method = shopId ? "PUT" : "POST";
            const url = shopId ? `http://localhost:8000/api/shops/${shopId}` : "http://localhost:8000/api/shops/";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ business_name: businessName, registration_number: registrationNumber }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Failed to save profile");
            }

            const data = await res.json();
            setShopId(data.id);
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddBranch = async () => {
        if (!shopId) return setError("Please save your Business Profile first.");
        if (!newCity || !newAddress) return setError("City and Address are required.");

        setError("");
        setIsAddingBranch(true);

        try {
            const res = await fetch(`http://localhost:8000/api/shops/${shopId}/branches`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ city: newCity, address: newAddress }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Failed to add branch");
            }

            const data = await res.json();
            setBranches([...branches, data]);
            setNewCity("");
            setNewAddress("");
            setBranchSuccess(true);
            setTimeout(() => setBranchSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAddingBranch(false);
        }
    };

    const handleToggleVacation = async (branchId: number, currentState: boolean) => {
        if (!shopId) return;
        try {
            const res = await fetch(`http://localhost:8000/api/shops/${shopId}/branches/${branchId}/toggle?is_active=${!currentState}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                // Update local UI state
                setBranches(current => current.map(b => b.id === branchId ? { ...b, is_active: !currentState } : b));
            }
        } catch (err) {
            console.error("Failed to toggle vacation mode:", err);
        }
    };

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground">{t("bloom_dashboard")}</h1>
                        <p className="text-foreground/70">{t("manage_business")}</p>
                    </div>

                    <div className="px-4 py-2 bg-secondary/20 rounded-full border border-border flex items-center gap-2">
                        <span className="text-sm font-medium">{t("growth_status")}</span>
                        {/* Seed to Bloom system */}
                        <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            🌱 {badge} Level
                        </div>
                    </div>
                </div>

                <div className="bg-card-bg border border-border rounded-3xl shadow-sm overflow-hidden text-foreground">
                    {/* Tabs */}
                    <div className="flex border-b border-border bg-secondary/5">
                        <button
                            onClick={() => setActiveTab("onboarding")}
                            className={`px-6 py-4 font-bold transition-colors ${activeTab === "onboarding" ? "text-primary border-b-2 border-primary" : "text-foreground/60 hover:text-foreground"}`}
                        >
                            {t("business_profile")}
                        </button>
                        <button
                            onClick={() => setActiveTab("branches")}
                            className={`px-6 py-4 font-bold transition-colors ${activeTab === "branches" ? "text-primary border-b-2 border-primary" : "text-foreground/60 hover:text-foreground"}`}
                        >
                            {t("branches")}
                        </button>
                        <button
                            onClick={() => setActiveTab("analytics")}
                            className={`px-6 py-4 font-bold transition-colors ${activeTab === "analytics" ? "text-primary border-b-2 border-primary" : "text-foreground/60 hover:text-foreground"}`}
                        >
                            {t("analytics")}
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === "onboarding" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-2xl font-bold mb-6">{t("uzb_ecommerce_reg")}</h2>

                                {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-xl">{error}</div>}

                                <div className="max-w-2xl space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t("reg_business_name")}</label>
                                        <input
                                            type="text"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-border bg-background"
                                            placeholder="e.g., Premium Flora LLC"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t("reg_number")}</label>
                                        <input
                                            type="text"
                                            value={registrationNumber}
                                            onChange={(e) => setRegistrationNumber(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-border bg-background"
                                            placeholder="9 digit registration number"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className={`mt-4 font-bold px-8 py-3 rounded-tl-[30px] rounded-br-[30px] rounded-tr-[10px] rounded-bl-[10px] transition-colors ${savedSuccess ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-accent"
                                            } disabled:opacity-50 flex items-center gap-2`}
                                    >
                                        {isSaving ? t("processing") : savedSuccess ? `✓ ${t("saved")}` : t("save_profile")}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "branches" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">{t("your_branches")}</h2>
                                </div>

                                {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-xl">{error}</div>}

                                {branches.length === 0 ? (
                                    <p className="text-foreground/60 mb-6">{t("no_branches")}</p>
                                ) : (
                                    <div className="grid gap-4 mb-8">
                                        {branches.map(b => (
                                            <div key={b.id} className="p-4 border border-border rounded-xl bg-secondary/5 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-lg flex items-center gap-2">
                                                        {b.city}
                                                        {!b.is_active && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Vacation Mode</span>}
                                                    </p>
                                                    <p className="text-foreground/70 text-sm">{b.address}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center cursor-pointer">
                                                        <div className="relative">
                                                            <input type="checkbox" className="sr-only" checked={b.is_active} onChange={() => handleToggleVacation(b.id, b.is_active)} />
                                                            <div className={`block w-10 h-6 rounded-full transition-colors ${b.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${b.is_active ? 'transform translate-x-4' : ''}`}></div>
                                                        </div>
                                                        <div className="ml-2 text-sm font-medium text-foreground/70">
                                                            {b.is_active ? "Active" : "Paused"}
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="bg-card-bg border border-border p-6 rounded-2xl max-w-2xl">
                                    <h3 className="font-bold text-lg mb-4">Add New Branch</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">City</label>
                                            <input
                                                value={newCity} onChange={(e) => setNewCity(e.target.value)}
                                                type="text" className="w-full p-3 rounded-xl border border-border bg-background" placeholder="e.g., Downtown"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Street Address</label>
                                            <input
                                                value={newAddress} onChange={(e) => setNewAddress(e.target.value)}
                                                type="text" className="w-full p-3 rounded-xl border border-border bg-background" placeholder="123 Amir Temur Street"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddBranch}
                                            disabled={isAddingBranch}
                                            className={`font-bold px-4 py-2 rounded-[20px] rounded-tr-[5px] rounded-bl-[5px] text-sm transition-colors ${branchSuccess ? "bg-green-600 text-white" : "bg-primary text-white hover:bg-accent"
                                                } disabled:opacity-50 flex items-center gap-2`}
                                        >
                                            {isAddingBranch ? t("processing") : branchSuccess ? `✓ ${t("branch_added")}` : t("add_branch")}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "analytics" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center text-foreground/50">
                                <span className="text-5xl mb-4">📈</span>
                                <p>{t("complete_profile_analytics")}</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
