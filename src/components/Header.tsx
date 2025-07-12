"use client";
import React, { useRef, useState } from "react";
import CartButton from "./CartButton";
import MainNav from "./MainNav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { userStore } from "@/store/userStore";
import UserLoginButton from "@/components/UserLoginButton";

export default function Header() {
  const cartButtonRef = useRef<{ openDropdown: () => void }>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const user = userStore((s) => s.user);

  return (
    <header
      className="w-full sticky top-0 z-50 transition-colors duration-300 bg-white/80 backdrop-blur shadow-md"
      style={{ borderRadius: "0 0 1.5rem 1.5rem" }}
    >
      <nav className="container mx-auto flex items-center justify-between py-2 px-4">
        {/* Desktop Nav */}
        <div className="hidden md:block">
          <MainNav />
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center border border-green-300 hover:bg-green-200 transition-colors"
            aria-label="Go to home page"
          >
            <span className="text-2xl">🍲</span>
          </Link>
          <Link
            href="/"
            className="font-bold text-lg text-green-700 tracking-wide hover:text-green-900 transition-colors"
            aria-label="Go to home page"
          >
            Nalan <span className="text-neutral-500">Batters</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user && <CartButton ref={cartButtonRef} />}
          <UserLoginButton />
        </div>
      </nav>
      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="absolute top-0 left-0 w-3/4 max-w-xs h-full bg-white shadow-lg p-6 flex flex-col gap-6 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <MainNav mobile onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease;
        }
      `}</style>
    </header>
  );
}
