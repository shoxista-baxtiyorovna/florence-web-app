"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
    const { t } = useLanguage();
    const { likedProductIds } = useWishlist();
    const { isAuthenticated, token } = useAuth();

    const [mounted, setMounted] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const fetchProductsLocal = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://localhost:8000/api/products/");
                if (res.ok) {
                    const allProducts = await res.json();
                    const liked = allProducts.filter((p: any) => likedProductIds.has(p.id));
                    setProducts(liked);
                }
            } catch (err) {
                console.error("Failed to fetch wishlist products", err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && token) {
            fetch("http://localhost:8000/api/auth/wishlist", {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setProducts(data);
                    } else {
                        console.error("API returned non-array data:", data);
                        setProducts([]);

                        // If auth failed, fallback to local
                        if (data?.detail === "Invalid token" || data?.detail === "User not found") {
                            fetchProductsLocal();
                        }
                    }
                    setLoading(false);
                })
                .catch(() => fetchProductsLocal());
        } else {
            fetchProductsLocal();
        }
    }, [mounted, likedProductIds, isAuthenticated, token]);

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="mb-10 flex items-center gap-3 border-b border-border pb-6">
                    <Heart size={32} className="text-accent fill-accent" />
                    <h1 className="text-4xl font-bold text-foreground">
                        {t("wishlist") || "My Wishlist"}
                    </h1>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 opacity-50">
                        {/* Shimmer loading placeholders could go here */}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24 bg-card-bg rounded-2xl shadow-sm border border-border">
                        <Heart size={64} strokeWidth={1} className="mx-auto text-foreground/20 mb-6" />
                        <h2 className="text-2xl font-medium text-foreground mb-4">{t("empty_wishlist") || "You haven't liked any items yet"}</h2>
                        <Link
                            href="/"
                            className="inline-block bg-accent text-white font-bold px-8 py-3 rounded-full hover:brightness-110 transition-colors shadow-md"
                        >
                            {t("discover_flowers") || "Discover Flowers"}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.isArray(products) && products.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
