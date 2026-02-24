"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Shield, 
  Truck, 
  Star, 
  ChefHat, 
  Leaf,
  Heart,
  Award
} from "lucide-react";

const features = [
  {
    icon: ChefHat,
    title: "Master Crafted",
    description: "Each batter is carefully prepared by our experienced chefs using traditional techniques passed down through generations.",
    badge: "Premium",
    color: "from-amber-600 to-yellow-600"
  },
  {
    icon: Leaf,
    title: "100% Natural",
    description: "Made with the finest organic ingredients, free from preservatives and artificial additives for pure, wholesome taste.",
    badge: "Organic",
    color: "from-slate-600 to-slate-700"
  },
  {
    icon: Clock,
    title: "Fresh Daily",
    description: "Prepared fresh every morning and delivered the same day to ensure maximum freshness and authentic flavors.",
    badge: "Same Day",
    color: "from-amber-500 to-amber-600"
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Lightning-fast delivery service covering all major areas with real-time tracking and temperature-controlled transport.",
    badge: "Express",
    color: "from-stone-600 to-stone-700"
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "Every batch undergoes rigorous quality checks and follows strict hygiene standards for your peace of mind.",
    badge: "Certified",
    color: "from-slate-700 to-slate-800"
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every product is infused with care and passion, bringing you the authentic taste of traditional home cooking.",
    badge: "Authentic",
    color: "from-amber-700 to-yellow-700"
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-16 px-4">
        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
          <Star className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600 fill-amber-600" />
          <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 text-xs sm:text-sm">
            Why Choose Us
          </Badge>
          <Star className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600 fill-amber-600" />
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6">
          <span
            className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 bg-clip-text text-transparent font-cursive"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Exceptional Quality
          </span>
        </h2>

        <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover what makes our batters special. Fresh ingredients, traditional recipes, modern convenience.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={index}
              className="group relative overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 hover:border-transparent"
            >
              {/* Gradient border effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[1px] rounded-[inherit]`}>
                <div className="bg-white rounded-[inherit] h-full w-full"></div>
              </div>
              
              <CardContent className="relative p-8 h-full flex flex-col">
                {/* Icon and Badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-gray-100 text-gray-700 border-gray-200 text-xs"
                  >
                    {feature.badge}
                  </Badge>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative element */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} rounded-full transition-all duration-500`}></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16">
        <div className=" p-8 shadow-lg border border-slate-50">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="w-6 h-6 text-amber-600" />
            <span className="text-slate-700 font-semibold">Trusted by thousands of happy customers</span>
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-slate-600 text-lg mb-6">
            Join our family of satisfied customers and experience the difference that quality makes.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Same Day Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-600" />
              <span>Quality Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
