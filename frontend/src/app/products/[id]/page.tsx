"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t, language } = useLanguage();
    const { addToCart } = useCart();
    const { likedProductIds, toggleLike } = useWishlist();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetch(`http://localhost:8000/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen bg-background"><Navbar /><div className="p-20 text-center uppercase tracking-widest font-bold text-foreground/50 animate-pulse">{t("processing") || "Loading..."}</div></div>;

    if (!product) return <div className="min-h-screen bg-background"><Navbar /><div className="p-20 text-center uppercase tracking-widest font-bold text-foreground/50">{t("no_results") || "Product Not Found"}</div></div>;

    const isLiked = likedProductIds.has(product.id);

    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-24">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-foreground/60 hover:text-accent mb-8 transition-colors text-sm font-bold uppercase tracking-wider"
                >
                    <ArrowLeft size={16} /> {t("back") || "Back"}
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/10 shadow-sm border border-border">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary/50">❋</div>
                        )}
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(product); }}
                            className="absolute top-6 right-6 z-10 w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all shadow-md group/heart"
                        >
                            <motion.div animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
                                <Heart
                                    size={26}
                                    strokeWidth={isLiked ? 0 : 1.5}
                                    className={`transition-colors ${isLiked ? 'fill-accent text-accent' : 'text-accent/60 group-hover/heart:text-accent'}`}
                                />
                            </motion.div>
                        </button>
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">{product.category}</span>
                            {product.is_trending && <span className="text-xs font-bold uppercase tracking-widest text-white bg-red-500 px-3 py-1 rounded-full">Trendy 🔥</span>}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-elegant text-foreground mb-4 leading-tight">
                            {language === 'uz' ? (product.title_uz || product.title) :
                                language === 'ru' ? (product.title_ru || product.title) :
                                    product.title}
                        </h1>

                        <div className="text-3xl font-light text-primary mb-8 tracking-tight">
                            ${product.price.toFixed(2)}
                        </div>

                        <p className="text-foreground/70 text-lg mb-10 leading-relaxed font-light">
                            {language === 'uz' ? (product.description_uz || product.description) :
                                language === 'ru' ? (product.description_ru || product.description) :
                                    product.description}
                        </p>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-12 py-6 border-y border-border/50 text-sm">
                            <div className="flex flex-col">
                                <span className="text-foreground/40 font-bold uppercase tracking-widest mb-1 text-[10px]">Format</span>
                                <span className="font-medium text-foreground capitalize">{product.format}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-foreground/40 font-bold uppercase tracking-widest mb-1 text-[10px]">Size</span>
                                <span className="font-medium text-foreground capitalize">{product.size}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-foreground/40 font-bold uppercase tracking-widest mb-1 text-[10px]">Main Flower</span>
                                <span className="font-medium text-foreground capitalize">{product.main_flower}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-foreground/40 font-bold uppercase tracking-widest mb-1 text-[10px]">Likes</span>
                                <span className="font-medium text-foreground flex items-center gap-1.5"><Heart size={14} className="text-accent fill-accent" /> {product.likes_count}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => addToCart(product)}
                            className="bg-accent text-white py-4 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 w-full border border-accent/20"
                        >
                            <ShoppingBag size={20} /> {t("add_to_cart") || "Add to Cart"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
