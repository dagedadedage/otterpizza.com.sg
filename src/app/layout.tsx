import type { Metadata } from "next";
import { Inter, Chelsea_Market, Caveat } from "next/font/google";
import { ConditionalNavbar, ConditionalFooter } from "@/components/layout/ConditionalNavbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/store/cart-context";
import { CartToast } from "@/components/cart/CartToast";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const chelseaMarket = Chelsea_Market({
  variable: "--font-chelsea-market",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://otterpizza.com.sg"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.png", sizes: "256x256", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  title: {
    default: "Singapore Neighbourhood Pizzeria | Otter Pizza",
    template: "%s | Otter Pizza",
  },
  description:
    "Otter Pizza — Singapore's neighbourhood pizzeria. Fresh, handcrafted pizzas for delivery and pickup. Order online now!",
  keywords: [
    "pizza",
    "Singapore",
    "Otter Pizza",
    "pizza delivery Singapore",
    "neighbourhood pizzeria",
    "order pizza online",
    "best pizza Singapore",
    "affordable pizza",
    "pizza near me",
    "pizza pickup",
    "handcrafted pizza",
    "fresh pizza delivery",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_SG",
    siteName: "Otter Pizza",
    title: "Singapore Neighbourhood Pizzeria | Otter Pizza",
    description:
      "Fresh, handcrafted pizzas for delivery and pickup. Order online now!",
    url: "https://otterpizza.com.sg",
    images: [
      {
        url: "https://otterpizza.com.sg/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Otter Pizza — Singapore's Neighbourhood Pizzeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Singapore Neighbourhood Pizzeria | Otter Pizza",
    description:
      "Fresh, handcrafted pizzas for delivery and pickup. Order online now!",
    images: ["https://otterpizza.com.sg/images/og-default.jpg"],
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "Bu2fjhVcoR5qLUdvbR8SJGaqfUKJuRQTewwkGBMTVaA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${chelseaMarket.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <SessionProvider>
          <CartProvider>
            <ConditionalNavbar />
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
            <CartToast />
          </CartProvider>
        </SessionProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
