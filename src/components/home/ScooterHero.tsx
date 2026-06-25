"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function MovingSet({ delay, className }: { delay?: string; className?: string }) {
  return (
    <div
      className={`absolute bottom-0 flex items-center gap-6 ${className || ""}`}
      style={{
        animation: "scoot-slide 20s linear infinite",
        animationDelay: delay,
      }}
    >
      {/* Scooter — 65% of original on mobile (50% + 30% boost) */}
      <Image
        src="/images/otter-scooter.png"
        alt=""
        width={440}
        height={390}
        className="w-52 sm:w-64 lg:w-80 lg:min-[640px]:w-96 h-auto drop-shadow-xl shrink-0"
        priority={!delay}
      />

      {/* Decorative ring around button */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Outer pulsing ring */}
        <div
          className="absolute w-28 h-28 lg:w-40 lg:h-40 rounded-full border-2 border-gold/30"
          style={{ animation: "pulse-ring 2s ease-out infinite" }}
        />
        <div
          className="absolute w-[6.5rem] h-[6.5rem] lg:w-36 lg:h-36 rounded-full border border-gold/20"
          style={{ animation: "pulse-ring 2s ease-out 0.3s infinite" }}
        />

        {/* Sparkle dots around ring */}
        <div className="absolute w-28 h-28 lg:w-40 lg:h-40 rounded-full" style={{ animation: "fairy-ring-spin 10s linear infinite" }}>
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold text-sm lg:text-lg">✦</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-gold text-xs lg:text-sm">✦</span>
          <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-xs lg:text-sm">✦</span>
          <span className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 text-primary text-sm lg:text-lg">✦</span>
        </div>

        {/* Large Order Now button — 30% smaller on mobile */}
        <Button variant="primary" size="lg" asChild className="relative z-10 text-xs lg:text-base w-24 h-24 lg:w-32 lg:h-32 rounded-full shadow-xl flex-col">
          <Link href="/order">
            <span className="leading-tight text-center">Order<br/>Now</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function ScooterHero() {
  return (
    <section className="relative min-h-[calc(85vh+5rem)] lg:min-h-[calc(100vh+5rem)] flex flex-col bg-cream overflow-hidden pt-20">
      {/* Floating decorative elements — static background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Scattered pizza/dot decorations */}
        <span className="absolute top-[15%] left-[10%] text-4xl opacity-20">🍕</span>
        <span className="absolute top-[20%] right-[12%] text-3xl opacity-15">🍕</span>
        <span className="absolute top-[35%] left-[5%] text-2xl opacity-10">🍕</span>
        <span className="absolute top-[40%] right-[8%] text-5xl opacity-15">🍕</span>

        {/* Decorative circles */}
        <div className="absolute top-[25%] left-[20%] w-32 h-32 rounded-full border border-primary/8" />
        <div className="absolute top-[30%] right-[18%] w-24 h-24 rounded-full border border-gold/10" />
        <div className="absolute top-[50%] left-[15%] w-16 h-16 rounded-full bg-primary/5" />
        <div className="absolute top-[45%] right-[25%] w-20 h-20 rounded-full bg-gold/8" />

        {/* Subtle ring decorations */}
        <div className="absolute top-[10%] right-[30%] w-40 h-40 rounded-full border border-primary/5" style={{ animation: "fairy-ring-spin 30s linear infinite" }} />
        <div className="absolute top-[55%] left-[25%] w-28 h-28 rounded-full border border-gold/10" style={{ animation: "fairy-ring-spin 25s linear infinite reverse" }} />
      </div>

      {/* Upper: scooter + content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-2 lg:pb-8">
        {/* Scooter animation track */}
        <div className="relative w-full overflow-hidden h-80 sm:h-96">
          <MovingSet delay="0s" />
          <MovingSet delay="-10s" className="lg:hidden" />
          <MovingSet delay="-7s" className="hidden lg:flex" />
          <MovingSet delay="-14s" className="hidden lg:flex" />
        </div>

        {/* Text + buttons */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center mt-4">
          <h1 className="sr-only">
            Otter Pizza — Singapore&apos;s Neighbourhood Pizzeria
          </h1>

          <p className="text-sm lg:text-base text-muted max-w-xs lg:max-w-md mx-auto leading-relaxed mb-8">
            Fresh, handcrafted pizzas made with quality ingredients.
            Order online for delivery or pickup across the island.
          </p>

          <div className="flex flex-row items-center justify-center gap-3 max-lg:flex-nowrap">
            <Button variant="primary" size="lg" asChild className="max-lg:text-sm max-lg:px-4 max-lg:py-2">
              <Link href="/menu">View Menu</Link>
            </Button>
            <Button variant="primary" size="lg" asChild className="max-lg:text-sm max-lg:px-4 max-lg:py-2">
              <Link href="/locate-us">Locate Us</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mural band — downsized (2 per width) + shifted up on mobile */}
      <div className="relative h-[20vh] lg:h-[30vh] w-full overflow-hidden -mt-2">
        <div className="mural-bg absolute inset-0 opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-6 lg:h-12 bg-gradient-to-b from-cream to-transparent" />
      </div>

      {/* Keyframes + responsive mural */}
      <style jsx>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .mural-bg {
          background-image: url(/images/mural-3.jpg);
          background-size: auto 100%;
          background-repeat: repeat-x;
          background-position: bottom center;
        }
        @media (min-width: 1024px) {
          .mural-bg {
            background-size: auto 100%;
          }
        }
      `}</style>
    </section>
  );
}
