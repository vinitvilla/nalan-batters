"use client";

import * as React from "react";
import { GoldButton } from "@/components/GoldButton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function HeroSection() {
  const images = [
    "https://picsum.photos/id/1015/1600/600",
    "https://picsum.photos/id/1016/1600/600",
    "https://picsum.photos/id/1020/1600/600",
    "https://picsum.photos/id/1024/1600/600",
    "https://picsum.photos/id/1035/1600/600"
  ];
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: false  })
  );

  return (
    <section
      id="hero"
      className="relative h-[75vh] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex items-center justify-center bg-black overflow-hidden"
    >
      <div className="absolute inset-0 h-full w-full">
        <Carousel
          plugins={[plugin.current]}
          className="h-full w-full"
        >
          <CarouselContent className="h-full w-full">
            {images.map((src, idx) => (
              <CarouselItem key={idx} className="h-full w-full">
                <img
                  src={src}
                  alt={`Hero ${idx + 1}`}
                  className="object-cover w-full h-full"
                  style={{ filter: "blur(2px)" }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20" />
        </Carousel>
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      </div>
      <div className="relative z-10 text-center text-white w-full flex flex-col items-center justify-center">
        <h1
          className="text-6xl sm:text-7xl font-extrabold mb-4 drop-shadow-lg"
          style={{
            fontFamily: "'Dancing Script', cursive",
            background: "linear-gradient(90deg, #FFD700 30%, #fff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.04em",
          }}
        >
          Nalan Batters
        </h1>
        <p className="text-lg sm:text-2xl mb-8 drop-shadow-md text-gray-200 font-light tracking-wide max-w-xl mx-auto">
          Finest culinary delights,{" "}
          <span className="text-yellow-200 font-semibold">crafted with love</span>.
        </p>
        <GoldButton
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("quickOrder");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Order Now
        </GoldButton>
      </div>
    </section>
  );
}
