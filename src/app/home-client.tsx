"use client";

import React, { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import QuickOrderSection from "@/components/QuickOrderSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import FeaturesSection from "@/components/FeaturesSection";
import DeliveryPartnerSection from "@/components/DeliveryPartnerSection";
import { StructuredData, homepageStructuredData, organizationStructuredData } from "@/components/StructuredData";
import { useProductStore } from "@/store/productStore";
import { useConfigStore } from "@/store/configStore";

export default function HomePageClient() {
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const loadAllConfigs = useConfigStore((s) => s.loadAllConfigs);

  useEffect(() => {
    const fetchData = async () => {
      fetchProducts();
      await loadAllConfigs();
    };
    fetchData();
  }, [fetchProducts, loadAllConfigs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      <StructuredData data={homepageStructuredData} />
      <StructuredData data={organizationStructuredData} />
      
      {/* Hero Section - Full width */}
      <HeroSection />
      
      {/* Main Content - Centered with proper spacing */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 -left-20 w-72 h-72 bg-gradient-to-r from-slate-200/10 to-stone-200/10 rounded-full blur-3xl"></div>
          <div className="absolute top-96 -right-20 w-96 h-96 bg-gradient-to-l from-stone-200/8 to-slate-200/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-1/3 w-64 h-64 bg-gradient-to-r from-slate-100/15 to-stone-100/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8">

          {/* Quick Order Section - Enhanced spacing */}
          <section className="py-12 lg:py-16">
            <QuickOrderSection />
          </section>

          {/* Features Section - New premium section */}
          <section className="py-12 lg:py-16">
            <FeaturesSection />
          </section>


          {/* Testimonials Section - Enhanced spacing */}
          <section className="py-12 lg:py-16">
            <TestimonialsSection />
          </section>

          {/* Delivery Partner Section - New recruitment section */}
          <section className="py-12 lg:py-16">
            <DeliveryPartnerSection />
          </section>

          {/* Contact Section - Enhanced spacing */}
          <section className="py-12 lg:py-16 pb-24">
            <ContactSection />
          </section>
        </div>
      </div>
    </div>
  );
}
