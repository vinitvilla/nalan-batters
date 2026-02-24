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
      className="relative h-[60vh] sm:h-[75vh] lg:h-[85vh] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Background Carousel */}
      <div className="absolute inset-0 h-full w-full">
        <Carousel
          plugins={[plugin.current]}
          className="h-full w-full"
        >
          <CarouselContent className="h-full w-full">
            {images.map((src, idx) => (
              <CarouselItem key={idx} className="h-[60vh] sm:h-[75vh] lg:h-[85vh] w-screen relative">
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
          {/* {images.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 border-white/20 hover:bg-white/20" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 border-white/20 hover:bg-white/20" />
            </>
          )} */}
        </Carousel>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center text-white w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-4 sm:py-0">
        {/* Trust Badges - Optimized for mobile */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-6">
          <Badge variant="secondary" className="bg-white/15 text-white border-white/30 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 fill-amber-300 text-amber-300" />
            <span className="hidden sm:inline">Premium Quality</span>
            <span className="sm:hidden">Premium</span>
          </Badge>
          <Badge variant="secondary" className="bg-white/15 text-white border-white/30 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm">
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-stone-300" />
            <span className="hidden sm:inline">Fresh Daily</span>
            <span className="sm:hidden">Fresh</span>
          </Badge>
          <Badge variant="secondary" className="bg-white/15 text-white border-white/30 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-slate-300" />
            <span className="hidden sm:inline">Local Delivery</span>
            <span className="sm:hidden">Local</span>
          </Badge>
        </div>

        {/* Main Headline */}
        <h1
          className="text-2xl sm:text-5xl lg:text-7xl font-extrabold mb-2 sm:mb-6 drop-shadow-2xl leading-tight"
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
        <h2 className="text-xs sm:text-lg lg:text-2xl mb-3 sm:mb-8 drop-shadow-lg text-gray-100 font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
          Fresh, authentic South Indian{" "}
          <span className="text-amber-200 font-medium">dosa batter & traditional food products</span>{" "}
          delivered to your door.
        </h2>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-3 sm:mb-8 w-full sm:w-auto px-2 sm:px-0">
          <GoldButton
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("quickOrder");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-4 text-sm sm:text-lg font-semibold shadow-2xl"
          >
            Order Now
          </GoldButton>
          <button
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 text-xs sm:text-base text-white border border-white/40 rounded-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm font-medium cursor-pointer"
          >
            Learn More
          </button>
        </div>

        {/* Value Proposition - Optimized for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 max-w-2xl mx-auto text-xs sm:text-sm px-2">
          <div className="text-center">
            <div className="text-amber-300 font-semibold text-xs sm:text-base">100% Fresh</div>
            <div className="text-gray-300 text-xs sm:text-sm">Made daily with premium ingredients</div>
          </div>
          <div className="text-center">
            <div className="text-amber-300 font-semibold text-xs sm:text-base">Fast Delivery</div>
            <div className="text-gray-300 text-xs sm:text-sm">Same-day delivery available</div>
          </div>
          <div className="text-center">
            <div className="text-amber-300 font-semibold text-xs sm:text-base">Trusted Quality</div>
            <div className="text-gray-300 text-xs sm:text-sm">Loved by thousands</div>
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
