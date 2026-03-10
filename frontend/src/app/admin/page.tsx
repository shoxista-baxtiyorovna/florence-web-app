"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
    const { token, isAuthenticated, user } = useAuth();
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated || !token || user?.role !== "admin") {
            setLoading(false);
            if (isAuthenticated && user?.role !== "admin") {
                setError("You do not have permission to view this page.");
            }
            return;
        }

        const fetchAllShops = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/shops/all", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch shop data from the server.");
                }

                const data = await res.json();
                setShops(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAllShops();
    }, [isAuthenticated, token, user]);

    if (!isAuthenticated || user?.role !== "admin") {
        return (
            <main className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-4xl font-elegant mb-6 text-foreground">Admin Access Required</h1>
                    <p className="text-foreground/70 mb-8 max-w-md mx-auto">Please log in securely using your administrator credentials to access the marketplace control panel.</p>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-foreground/50 tracking-widest uppercase text-sm font-bold animate-pulse">Loading Admin Data...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-12 text-center flex-1 w-full">
                    <div className="bg-red-50 text-red-700 p-8 rounded-2xl max-w-lg mx-auto border border-red-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-2 font-elegant">Access Denied</h2>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="mb-12 border-b border-border pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-elegant text-foreground mb-3 tracking-tight">Marketplace Administration</h1>
                        <p className="text-sm font-medium tracking-[0.1em] text-foreground/50 uppercase">Overview of all active flora vendors and branches.</p>
                    </div>
                    <div className="bg-secondary/10 text-secondary border border-secondary/20 px-6 py-2.5 rounded-full font-bold text-sm tracking-wide shadow-sm">
                        Total Boutiques: {shops.length}
                    </div>
                </div>

                <div className="grid gap-8">
                    {shops.length === 0 ? (
                        <p className="text-foreground/50 p-12 bg-card-bg rounded-2xl border border-border text-center font-medium italic">
                            No boutiques registered yet.
                        </p>
                    ) : (
                        shops.map(shop => (
                            <div key={shop.id} className="bg-card-bg border border-border rounded-xl p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden relative transition-all hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)]">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-border pb-6 gap-4">
                                    <div>
                                        <h2 className="text-3xl font-elegant text-foreground tracking-tight">{shop.business_name}</h2>
                                        <p className="text-xs tracking-wider text-foreground/40 font-bold uppercase mt-2">
                                            INN: <span className="text-foreground/70">{shop.registration_number || "Pending"}</span> • Owner ID: <span className="text-foreground/70">{shop.owner_id}</span>
                                        </p>
                                    </div>
                                    <span className="bg-accent/10 text-accent border border-accent/20 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-sm">
                                        {shop.badge} Tier
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/40 mb-4 flex items-center gap-2">
                                        Active Delivery Hubs <span className="bg-foreground/5 text-foreground px-2 py-0.5 rounded-full">{shop.branches?.length || 0}</span>
                                    </h3>
                                    {shop.branches && shop.branches.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {shop.branches.map((branch: any) => (
                                                <div key={branch.id} className="bg-background/50 p-5 rounded-lg border border-border/50 hover:border-secondary/30 transition-colors">
                                                    <div className="font-bold text-sm tracking-wide text-foreground flex items-center gap-2">
                                                        <span className="text-secondary">📍</span> {branch.city}
                                                    </div>
                                                    <div className="text-xs text-foreground/60 mt-2 pl-6 font-medium leading-relaxed">
                                                        {branch.address}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-foreground/40 italic font-medium">No locations have been mapped by this vendor yet.</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
