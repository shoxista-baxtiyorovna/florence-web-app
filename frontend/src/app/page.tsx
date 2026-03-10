"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { CartItem } from "@/context/CartContext";

export default function Home() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<(Omit<CartItem, 'quantity'> & { description: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const [city, setCity] = useState("Capital City");
  const [flowerType, setFlowerType] = useState("");
  const [format, setFormat] = useState("");
  const [size, setSize] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [isTrending, setIsTrending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hydration & Location
  useEffect(() => {
    setMounted(true);
    const savedCity = sessionStorage.getItem("userCity");
    if (savedCity) setCity(savedCity);
  }, []);

  // Fetch products dynamically when filters change
  useEffect(() => {
    setLoading(true);
    let url = `http://localhost:8000/api/products/?city=${encodeURIComponent(city)}`;
    if (flowerType) url += `&main_flower=${encodeURIComponent(flowerType)}`;
    if (format) url += `&format=${encodeURIComponent(format)}`;
    if (size) url += `&size=${encodeURIComponent(size)}`;
    if (sortBy) url += `&sort_by=${encodeURIComponent(sortBy)}`;
    if (isTrending) url += `&is_trending=true`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, [city, flowerType, format, size, sortBy, isTrending]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />

      <section id="products" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl lg:text-5xl font-elegant text-foreground mb-6 tracking-tight">
            {t("our_collection_in")} <span className="text-accent">{city}</span>
          </h2>
          <div className="h-0.5 w-24 bg-secondary/50 mx-auto rounded-full mb-8"></div>
        </div>

        {/* Florence Advanced Filters */}
        <div className="bg-card-bg border border-border/60 rounded-2xl p-6 shadow-sm mb-12 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <select value={flowerType} onChange={(e) => setFlowerType(e.target.value)} className="bg-background border border-border text-foreground/80 text-sm rounded-full px-5 py-2.5 outline-none focus:border-accent transition-colors appearance-none font-medium">
              <option value="">{t("all_flowers")}</option>
              <option value="roses">{t("roses")}</option>
              <option value="daisies">{t("daisies")}</option>
              <option value="peonies">{t("peonies")}</option>
              <option value="tulips">{t("tulips")}</option>
              <option value="sunflowers">{t("sunflowers")}</option>
              <option value="orchids">{t("orchids")}</option>
            </select>

            <select value={format} onChange={(e) => setFormat(e.target.value)} className="bg-background border border-border text-foreground/80 text-sm rounded-full px-5 py-2.5 outline-none focus:border-accent transition-colors appearance-none font-medium">
              <option value="">{t("any_format")}</option>
              <option value="bouquet">{t("format_bouquet")}</option>
              <option value="box">{t("in_the_box")}</option>
              <option value="basket">{t("format_basket")}</option>
            </select>

            <select value={size} onChange={(e) => setSize(e.target.value)} className="bg-background border border-border text-foreground/80 text-sm rounded-full px-5 py-2.5 outline-none focus:border-accent transition-colors appearance-none font-medium">
              <option value="">{t("any_size")}</option>
              <option value="small">{t("size_small")}</option>
              <option value="average">{t("size_average")}</option>
              <option value="big">{t("size_big")}</option>
            </select>

            <button
              onClick={() => setIsTrending(!isTrending)}
              className={`text-sm rounded-full px-5 py-2.5 transition-colors font-bold ${isTrending ? 'bg-accent text-white shadow-md' : 'bg-background border border-border text-foreground/80 hover:border-accent'}`}
            >
              🔥 {t("trendy_only")}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">{t("sort_by")}</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-primary/5 border border-primary/10 text-primary text-sm rounded-full px-5 py-2.5 outline-none focus:border-primary transition-colors appearance-none font-bold">
              <option value="">{t("featured")}</option>
              <option value="rating_desc">{t("highest_rated")}</option>
              <option value="price_asc">{t("price_low_high")}</option>
              <option value="price_desc">{t("price_high_low")}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-20">
              <span className="text-foreground/50 tracking-widest uppercase text-sm font-bold animate-pulse">
                {t("curating_collection")}
              </span>
            </div>
          ) : (
            products
              .filter(p => !searchQuery ||
                p.title.toLowerCase().includes(searchQuery) ||
                (p as any).title_uz?.toLowerCase().includes(searchQuery) ||
                (p as any).title_ru?.toLowerCase().includes(searchQuery) ||
                (p.category && p.category.toLowerCase().includes(searchQuery)) ||
                (p as any).main_flower?.toLowerCase().includes(searchQuery))
              .map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
          )}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-background border-t border-border/50 py-16 mt-20 text-center text-foreground/40 text-xs tracking-widest uppercase font-bold">
        <p>© {new Date().getFullYear()} {t("all_rights_reserved")}</p>
      </footer>
    </main>
  );
}
