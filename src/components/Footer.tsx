import React from "react";
import { Instagram, Facebook, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t mt-8 py-6 text-center text-sm text-gray-500">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <span className="mb-2 md:mb-0 block text-center md:text-left">
          &copy; {new Date().getFullYear()} Nalan Batters. All rights reserved.
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end items-center w-full md:w-auto">
          <a
            href="mailto:hello@nalanbatters.com"
            className="hover:text-green-600 transition-colors"
          >
            hello@nalanbatters.com
          </a>
          <a
            href="https://www.instagram.com/nalan_batters/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
            aria-label="Instagram"
          >
            <Instagram className="inline-block w-4 h-4" /> Instagram
          </a>
          <a
            href="https://www.facebook.com/p/Nalan-Batters-61566853659372/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
            aria-label="Facebook"
          >
            <Facebook className="inline-block w-4 h-4" /> Facebook
          </a>
          <a
            href="https://wa.me/14372154049"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-600 transition-colors flex items-center gap-1"
            aria-label="WhatsApp"
          >
            <Phone className="inline-block w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
