import type { Metadata } from "next";
import { Inter, Chelsea_Market, Caveat } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/store/cart-context";
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
    "delivery",
    "neighbourhood pizzeria",
    "order pizza",
  ],
  openGraph: {
    type: "website",
    locale: "en_SG",
    siteName: "Otter Pizza",
    title: "Singapore Neighbourhood Pizzeria | Otter Pizza",
    description:
      "Fresh, handcrafted pizzas for delivery and pickup. Order online now!",
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
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
