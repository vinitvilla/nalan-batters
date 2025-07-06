"use client";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative h-[60vh] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://picsum.photos/1600/600?blur=2')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 text-center text-white">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Nalan Batters</h1>
        <p className="text-xl mb-6 drop-shadow-md">Finest culinary delights, crafted with love.</p>
        <Button
          size="lg"
          className="bg-green-400 text-white font-bold hover:bg-green-500 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("quickOrder");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Order Now
        </Button>
      </div>
    </section>
  );
}
