"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import LocationOverlay from "@/components/LocationOverlay";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <LanguageProvider>
                <WishlistProvider>
                    <CartProvider>
                        <LocationOverlay />
                        {children}
                    </CartProvider>
                </WishlistProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}
