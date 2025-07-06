"use client";

import React, { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import QuickOrderSection from "@/components/QuickOrderSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ProductList from "@/components/ProductList";
import { useProductStore } from "@/store/productStore";

export default function HomePage() {
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 md:px-8">
      <HeroSection />
      <div className="max-w-7xl mx-auto">
        <div className="mt-6 md:mt-10">
          <QuickOrderSection />
        </div>
        <ProductList products={products} />
        <div className="mt-8 md:mt-16">
          <TestimonialsSection />
        </div>
        <div className="mt-8 md:mt-16 mb-8">
          <ContactSection />
        </div>
      </div>
      <Footer />
    </div>
  );
}