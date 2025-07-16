"use client";
import React, { useRef, useState, useEffect } from "react";
import CartButton from "./CartButton";
import MainNav from "./MainNav";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, Home, UtensilsCrossed, Phone } from "lucide-react";
import Link from "next/link";
import { userStore } from "@/store/userStore";
import UserLoginButton from "@/components/UserLoginButton";
import "../styles/theme.css";

const navigationItems = [
  { id: "hero", label: "Home", icon: Home },
  { id: "quickOrder", label: "Menu", icon: UtensilsCrossed },
  { id: "contact", label: "Contact", icon: Phone },
];

export default function Header() {
  const cartButtonRef = useRef<{ openDropdown: () => void }>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = userStore((s) => s.user);

  // Handle scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle smooth scroll navigation
  const handleNavigation = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileNavOpen(false);
  };

  return (
    <>
      {/* Main Header */}
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100' 
          : 'bg-white/80 backdrop-blur-md'
        }
      `}>
        <div className="container mx-auto">
          <nav className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:scale-105 transition-all duration-300 cursor-pointer group z-10"
              aria-label="Go to home page"
            >
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-6">
                  <span className="text-xl lg:text-2xl filter drop-shadow-sm">🍲</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-60 group-hover:opacity-80 transition-opacity"></div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span 
                  className="font-bold text-xl lg:text-2xl tracking-wide bg-gradient-to-r from-gray-800 via-orange-600 to-amber-600 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105" 
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  Nalan Batters
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wider uppercase -mt-1">Premium Quality</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <MainNav />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* User Login */}
              <UserLoginButton />
              <CartButton ref={cartButtonRef} />
              
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden relative p-2 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-all duration-200 rounded-xl"
                aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
              >
                <div className="relative w-6 h-6">
                  <Menu 
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                      mobileNavOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'
                    }`} 
                  />
                  <X 
                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                      mobileNavOpen ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'
                    }`} 
                  />
                </div>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div className={`
        fixed inset-0 z-40 lg:hidden transition-all duration-300
        ${mobileNavOpen ? 'visible opacity-100' : 'invisible opacity-0'}
      `}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileNavOpen(false)}
        />
        
        {/* Navigation Panel */}
        <div className={`
          absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl
          transform transition-transform duration-300 ease-out
          ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
                <span className="text-xl">🍲</span>
              </div>
              <div>
                <span className="font-bold text-lg text-gray-800" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Nalan Batters
                </span>
                <div className="text-xs text-gray-500 font-medium">Premium Quality</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className="w-full flex items-center gap-4 px-4 py-4 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 font-medium group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-lg">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-2">Fresh batters delivered daily</p>
              <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
                <span>Premium Quality</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
