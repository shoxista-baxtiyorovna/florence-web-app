import type { Metadata } from "next";
import "./globals.css";
import React from 'react';
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Script from "next/script";
import TelegramInitializer from "@/components/TelegramInitializer";

export const metadata: Metadata = {
  title: "Florence | Premium Floral Delivery",
  description: "Luxury flower arrangements delivered in Tashkent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-background text-foreground`}
      >
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <TelegramInitializer />
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
