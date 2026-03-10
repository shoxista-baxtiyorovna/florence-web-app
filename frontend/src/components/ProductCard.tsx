"use client";
import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useCart, CartItem } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";

interface ProductCardProps {
    product: Omit<CartItem, "quantity"> & {
        description: string;
        description_uz?: string | null;
        description_ru?: string | null;
    };
    index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
    const { t, language } = useLanguage();
    const { addToCart } = useCart();
    const { likedProductIds, toggleLike } = useWishlist();

    const isLiked = likedProductIds.has(product.id);

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: index * 0.1 }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -5 }}
            className="bg-card-bg rounded-xl overflow-hidden shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] transition-all duration-400 group flex flex-col h-full border border-border"
        >
            <div className="relative h-72 overflow-hidden bg-secondary/10">
                {/* Wishlist Heart Button */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(product); }}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm group/heart"
                    aria-label="Toggle Wishlist"
                >
                    <motion.div animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
                        <Heart
                            size={20}
                            strokeWidth={isLiked ? 0 : 1.5}
                            className={`transition-colors ${isLiked ? 'fill-accent text-accent' : 'text-accent/60 group-hover/heart:text-accent'}`}
                        />
                    </motion.div>
                </button>

                {/* Placeholder image logic */}
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-secondary">
                        <span className="text-4xl mb-3 opacity-70">❋</span>
                        <span className="text-xs font-medium tracking-widest uppercase opacity-50">{t("coming_soon")}</span>
                    </div>
                )}
            </div>

            <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-elegant text-foreground mb-3 group-hover:text-accent transition-colors">
                    {language === 'uz' ? (product.title_uz || product.title) :
                        language === 'ru' ? (product.title_ru || product.title) :
                            product.title}
                </h3>
                <p className="text-foreground/60 text-sm mb-6 line-clamp-2 leading-relaxed font-light">
                    {language === 'uz' ? (product.description_uz || product.description) :
                        language === 'ru' ? (product.description_ru || product.description) :
                            product.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <span className="text-xl font-medium tracking-tight text-primary">
                        ${product.price.toFixed(2)}
                    </span>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(product)}
                        className="bg-accent text-white px-6 py-2.5 rounded-petal font-bold text-[11px] tracking-[0.15em] uppercase hover:brightness-110 transition-all shadow-md hover:shadow-lg"
                    >
                        {t("add_to_cart")}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
