"use client";

import * as React from "react";
import Image from "next/image";
import { GoldButton } from "@/components/GoldButton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

export default function HeroSection() {
  const images = [
    "/hero1.jpg",
    "/hero2.jpg",
    "/hero3.jpg",
  ];
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: false })
  );

  return (
    <section
      id="hero"
      className="relative h-[85vh] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Background Carousel */}
      <div className="absolute inset-0 h-full w-full">
        <Carousel
          plugins={[plugin.current]}
          className="h-full w-full"
        >
          <CarouselContent className="h-full w-full">
            {images.map((src, idx) => (
              <CarouselItem key={idx} className="h-[85vh] w-screen relative">
                <Image
                  src={src}
                  alt={`Fresh South Indian dosa batter and authentic food products - Hero image ${idx + 1}`}
                  fill
                  className="object-cover"
                  style={{ filter: "blur(1px) brightness(0.7)" }}
                  priority={idx === 0}
                  sizes="100vw"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 border-white/20 hover:bg-white/20" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 border-white/20 hover:bg-white/20" />
            </>
          )}
        </Carousel>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <Badge variant="secondary" className="bg-white/15 text-white border-white/30 backdrop-blur-sm px-3 py-1">
            <Star className="w-3 h-3 mr-1 fill-amber-300 text-amber-300" />
            Premium Quality
          </Badge>
          <Badge variant="secondary" className="bg-white/15 text-white border-white/30 backdrop-blur-sm px-3 py-1">
            <Clock className="w-3 h-3 mr-1 text-stone-300" />
            Fresh Daily
          </Badge>
          <Badge variant="secondary" className="bg-white/15 text-white border-white/30 backdrop-blur-sm px-3 py-1">
            <MapPin className="w-3 h-3 mr-1 text-slate-300" />
            Local Delivery
          </Badge>
        </div>

        {/* Main Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 drop-shadow-2xl leading-tight"
          style={{
            fontFamily: "var(--font-dancing-script), cursive",
            background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 50%, #fff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.02em",
          }}
        >
          Nalan Batters
          <span className="sr-only">
            {" "}— Fresh Dosa Batter &amp; South Indian Food Delivery in Scarborough, Toronto
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="text-lg sm:text-xl lg:text-2xl mb-8 drop-shadow-lg text-gray-100 font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
          Fresh, authentic South Indian{" "}
          <span className="text-amber-200 font-medium">dosa batter & traditional food products</span>{" "}
          delivered to your door. Premium quality, traditional recipes.
        </h2>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <GoldButton
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("quickOrder");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 text-lg font-semibold shadow-2xl"
          >
            Order Now
          </GoldButton>
          <button
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 text-white border border-white/40 rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm font-medium cursor-pointer"
          >
            Learn More
          </button>
        </div>

        {/* Value Proposition */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-sm">
          <div className="text-center">
            <div className="text-amber-300 font-semibold">100% Fresh</div>
            <div className="text-gray-300">Made daily with premium ingredients</div>
          </div>
          <div className="text-center">
            <div className="text-amber-300 font-semibold">Fast Delivery</div>
            <div className="text-gray-300">Same-day delivery available</div>
          </div>
          <div className="text-center">
            <div className="text-amber-300 font-semibold">Trusted Quality</div>
            <div className="text-gray-300">Loved by thousands of customers</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
