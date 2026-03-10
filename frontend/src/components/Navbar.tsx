"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Search, Heart, User as UserIcon, Shield, Menu, Flower, MapPin } from "lucide-react";
import LoginModal from "./LoginModal";

export default function Navbar() {
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const { items } = useCart();
    const { isAuthenticated, logout, user } = useAuth();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [city, setCity] = useState("Toshkent");

    // Search specific state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const savedCity = sessionStorage.getItem("userCity");
        if (savedCity) setCity(savedCity);

        // Pre-fetch all products for instant localized frontend search
        fetch(process.env.NEXT_PUBLIC_API_URL + "/api/products/")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAllProducts(data);
            })
            .catch(console.error);
    }, []);

    // 300ms Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle instant filtering when debounced typing updates
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const lowerQuery = debouncedQuery.toLowerCase();
        const results = allProducts.filter(p =>
            p.title.toLowerCase().includes(lowerQuery) ||
            p.title_uz?.toLowerCase().includes(lowerQuery) ||
            p.title_ru?.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            p.main_flower?.toLowerCase().includes(lowerQuery)
        );

        setSearchResults(results.slice(0, 5)); // show max 5 suggestions
        setShowDropdown(true);
    }, [debouncedQuery, allProducts]);

    const handleSearchCommit = (forceQuery?: string) => {
        const finalQuery = forceQuery !== undefined ? forceQuery : searchQuery;
        window.dispatchEvent(new CustomEvent('globalSearch', { detail: finalQuery }));
        setShowDropdown(false);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="w-full flex flex-col z-50 shadow-md">
            {/* Tier 1: White Header Top Bar */}
            <div className="bg-background text-foreground tracking-wide border-b border-border">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-[88px] flex items-center justify-between">

                    {/* Left: Logo & Delivery Info */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Flower className="w-8 h-8 text-[#D4AF37] group-hover:rotate-45 transition-transform duration-500 drop-shadow-sm" strokeWidth={1} />
                            <div className="flex flex-col">
                                <span className="text-3xl font-elegant tracking-widest text-foreground">Florence</span>
                            </div>
                        </Link>

                        <div className="hidden lg:flex flex-col gap-1 text-[11px] text-foreground/70 border-l border-border pl-6 ml-2">
                            <p className="flex items-center gap-1 font-medium"><MapPin size={12} className="text-primary" /> {t("delivering_in")} <span className="font-bold text-foreground">{city}</span></p>
                            <button onClick={() => window.dispatchEvent(new Event('openLocationOverlay'))} className="text-accent font-bold text-left hover:underline text-[10px] uppercase tracking-wider">{t("change_city")}</button>
                        </div>
                    </div>

                    {/* Right: Toggles & Icons */}
                    <div className="flex items-center gap-5">
                        <div className="hidden md:flex items-center gap-2 text-[11px] font-bold bg-card-bg px-2 py-1.5 rounded-full border border-border/50 shadow-sm">
                            <button onClick={() => setLanguage("uz")} className={`px-2.5 py-1 rounded-full transition-colors ${language === "uz" ? "bg-primary text-white shadow-sm" : "text-foreground/40 hover:text-foreground"}`}>UZ</button>
                            <button onClick={() => setLanguage("ru")} className={`px-2.5 py-1 rounded-full transition-colors ${language === "ru" ? "bg-primary text-white shadow-sm" : "text-foreground/40 hover:text-foreground"}`}>RU</button>
                            <button onClick={() => setLanguage("en")} className={`px-2.5 py-1 rounded-full transition-colors ${language === "en" ? "bg-primary text-white shadow-sm" : "text-foreground/40 hover:text-foreground"}`}>EN</button>
                        </div>

                        {/* Interactive Icons */}
                        {/* Expandable Search Input Container */}
                        <div className="flex items-center gap-5 ml-4 text-foreground/80 relative">
                            <div className="relative flex items-center group hidden sm:flex">
                                <Search size={22} strokeWidth={1.5} className="absolute left-3 text-foreground/40 group-focus-within:text-accent transition-colors pointer-events-none z-10" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchCommit();
                                        }
                                    }}
                                    onFocus={() => { if (searchQuery) setShowDropdown(true); }}
                                    placeholder={t("search") || "Search..."}
                                    className="pl-10 pr-4 py-1.5 bg-secondary/5 border border-border rounded-full text-sm outline-none focus:border-accent focus:bg-white w-32 focus:w-64 transition-all duration-300 placeholder:text-foreground/30 font-medium relative z-10"
                                />

                                {/* Search Dropdown Panel */}
                                {showDropdown && (
                                    <>
                                        {/* Click-away overlay */}
                                        <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)} />

                                        <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-border/60 overflow-hidden z-20 flex flex-col">
                                            {searchResults.length > 0 ? (
                                                <div className="flex flex-col">
                                                    {searchResults.map((product) => (
                                                        <button
                                                            key={product.id}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setSearchQuery("");
                                                                setShowDropdown(false);
                                                                router.push(`/products/${product.id}`);
                                                            }}
                                                            className="flex items-center gap-4 p-3 hover:bg-secondary/10 hover:scale-[1.01] transition-all duration-200 border-b border-border/30 last:border-0 text-left w-full cursor-pointer"
                                                        >
                                                            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex-shrink-0 overflow-hidden">
                                                                {product.image_url ? (
                                                                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="w-full h-full flex items-center justify-center text-secondary/50">❋</span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col flex-1 truncate">
                                                                <span className="text-sm font-medium text-foreground truncate">
                                                                    {language === 'uz' ? (product.title_uz || product.title) :
                                                                        language === 'ru' ? (product.title_ru || product.title) :
                                                                            product.title}
                                                                </span>
                                                                <span className="text-xs text-foreground/50">${product.price.toFixed(2)}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 flex flex-col items-center justify-center text-center">
                                                    <Search size={32} strokeWidth={1} className="text-foreground/20 mb-3" />
                                                    <p className="text-foreground text-sm font-medium mb-1">{t("no_results") || "No results found"}</p>
                                                    <button
                                                        onClick={() => { setSearchQuery(""); handleSearchCommit(""); }}
                                                        className="text-xs font-bold text-accent underline mt-2 uppercase tracking-wide opacity-80 hover:opacity-100"
                                                    >
                                                        {t("clear_search") || "Clear search"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <Link href="/wishlist" className="hover:text-accent transition-colors relative" aria-label="View Wishlist">
                                <Heart size={22} strokeWidth={1.5} />
                            </Link>

                            <Link href="/cart" className="relative hover:text-accent transition-colors block border-r border-border pr-6">
                                <ShoppingCart size={22} strokeWidth={1.5} />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 right-4 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>

                            {isAuthenticated ? (
                                <div className="flex items-center gap-4 border-l border-border pl-4">
                                    <Link href={user?.role === "seller" ? "/seller" : "/profile"} className="hover:text-secondary transition-colors block" title={t("profile")}>
                                        <UserIcon size={20} strokeWidth={1.5} />
                                    </Link>

                                    {user?.role === "admin" && (
                                        <Link href="/admin" className="text-[10px] uppercase tracking-wider font-bold text-white bg-primary px-4 py-2 rounded-full hover:brightness-110 transition-colors flex items-center gap-1 shadow-sm">
                                            <Shield size={12} /> {t("admin")}
                                        </Link>
                                    )}

                                    <button onClick={logout} className="text-xs uppercase tracking-wider font-bold text-foreground/50 hover:text-foreground transition-colors">
                                        Log Out
                                    </button>
                                </div>
                            ) : (
                                <div className="border-l border-border pl-4">
                                    <button onClick={() => setIsLoginModalOpen(true)} className="text-[10px] uppercase tracking-wider font-bold text-white bg-accent px-4 py-2 rounded-full hover:brightness-110 transition-colors shadow-sm">
                                        Log In
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </header>
    );
}
