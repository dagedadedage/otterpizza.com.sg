import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  // 301 redirects from old Wix URLs (otterpizza.com.sg) to new Next.js URLs
  async redirects() {
    return [
      // --- Category pages ---
      { source: "/category/all-products", destination: "/order", permanent: true },
      { source: "/category/specialty", destination: "/order?category=specialty", permanent: true },
      { source: "/category/premium", destination: "/order?category=premium", permanent: true },
      { source: "/category/classic", destination: "/order?category=classic", permanent: true },
      { source: "/category/sides", destination: "/order?category=sides", permanent: true },

      // --- Product pages (Classic 1xx) ---
      { source: "/product-page/101-otter-s-hawaiian-12", destination: "/menu/otters-hawaiian-12", permanent: true },
      { source: "/product-page/102-ham-and-cheese-12", destination: "/menu/ham-cheese-special-12", permanent: true },
      { source: "/product-page/103-pepperoni-classic-12", destination: "/menu/pepperoni-classic-12", permanent: true },
      { source: "/product-page/104-beef-pineapple-12", destination: "/menu/beef-pineapple-12", permanent: true },
      { source: "/product-page/105-cheese-melt-12", destination: "/menu/cheese-melt-12", permanent: true },
      { source: "/product-page/106-margarita-12", destination: "/menu/margherita-12", permanent: true },
      { source: "/product-page/107-veffie-delight-12", destination: "/menu/veggie-delight-12", permanent: true },
      { source: "/product-page/108-mushroom-speciality-12", destination: "/menu/mushroom-speciality-12", permanent: true },

      // --- Product pages (Premium 2xx) ---
      { source: "/product-page/201-otter-s-all-in-signature-12", destination: "/menu/otters-all-in-signature-12", permanent: true },
      { source: "/product-page/202-otters-all-meat-signature-12", destination: "/menu/otters-all-meat-signature-12", permanent: true },
      { source: "/product-page/203-four-cheese-12", destination: "/menu/four-cheese-12", permanent: true },
      { source: "/product-page/204-teriyaki-chicken-12", destination: "/menu/teriyaki-chicken-12", permanent: true },
      { source: "/product-page/205-flossy-bbq-chicken-12", destination: "/menu/flossy-bbq-chicken-12", permanent: true },
      { source: "/product-page/206-beef-up-12", destination: "/menu/beef-up-12", permanent: true },
      { source: "/product-page/207-hawaiian-overload-12", destination: "/menu/hawaiian-overload-12", permanent: true },
      { source: "/product-page/208-pepproni-overload-12", destination: "/menu/pepperoni-overload-12", permanent: true },

      // --- Product pages (Specialty 3xx) ---
      { source: "/product-page/301-cajun-prawn-delight-12", destination: "/menu/cajun-prawn-delight-12", permanent: true },
      { source: "/product-page/302-seafood-favourite-12", destination: "/menu/seafood-favourite-12", permanent: true },
      { source: "/product-page/303-smoked-salmon-special-12", destination: "/menu/smoked-salmon-special-12", permanent: true },
      { source: "/product-page/304-roti-john-12", destination: "/menu/roti-john-12", permanent: true },
      { source: "/product-page/305-deluxe-pizza-burger-12", destination: "/menu/deluxe-pizza-burger-12", permanent: true },
      { source: "/product-page/306-durian-mango-feast-12", destination: "/menu/durian-mango-feast-12", permanent: true },

      // --- Product pages (Sides 4xx) ---
      { source: "/product-page/401-chicken-drumlets-6pcs", destination: "/menu/chicken-drumlets-6pcs", permanent: true },
      { source: "/product-page/402-potato-wedges-with-dip", destination: "/menu/potato-wedges-with-dip", permanent: true },
      { source: "/product-page/403-chicken-nuggets", destination: "/menu/chicken-nuggets", permanent: true },
      { source: "/product-page/404-garlic-bread", destination: "/menu/garlic-bread", permanent: true },

      // --- Product pages (Beverages 5xx) ---
      { source: "/product-page/501-coke", destination: "/menu/coke", permanent: true },
      { source: "/product-page/502-sprite", destination: "/menu/sprite", permanent: true },
      { source: "/product-page/503-100plus", destination: "/menu/100plus", permanent: true },
      { source: "/product-page/504-ice-lemon-tea", destination: "/menu/ice-lemon-tea", permanent: true },
      { source: "/product-page/505-ribena-sparkling", destination: "/menu/ribena-sparkling", permanent: true },

      // --- Legacy PDF files ---
      { source: "/_files/ugd/:path*", destination: "/menu", permanent: true },

      // --- Domain consolidation (otterpizza.com → www.otterpizza.com.sg) ---
      {
        source: "/:path*",
        has: [{ type: "host", value: "otterpizza.com" }],
        destination: "https://www.otterpizza.com.sg/:path*",
        permanent: true,
      },

      // --- non-www → www (consolidate to canonical domain) ---
      {
        source: "/:path*",
        has: [{ type: "host", value: "otterpizza.com.sg" }],
        destination: "https://www.otterpizza.com.sg/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
