"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Star, Clock, DollarSign, Users, CheckCircle } from "lucide-react";

export default function DeliveryPartnerSection() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Submit to contact messages API
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Delivery Partner Inquiry",
          mobile: phoneNumber,
          message: `Interested in becoming a delivery partner. Contact number: ${phoneNumber}`,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setPhoneNumber("");
      }
    } catch (error) {
      console.error("Error submitting delivery partner inquiry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-stone-50"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-200 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                <Truck className="w-4 h-4 mr-2" />
                Join Our Team
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Wanna be our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">
                  delivery partner?
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Join our growing network of delivery partners and earn flexible income while serving your community with fresh, authentic batters.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-100">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Competitive Pay</p>
                  <p className="text-sm text-gray-600">Earn per delivery</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Flexible Hours</p>
                  <p className="text-sm text-gray-600">Work when you want</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-stone-100">
                <div className="w-10 h-10 bg-stone-100 text-stone-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Great Community</p>
                  <p className="text-sm text-gray-600">Join our team</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-yellow-100">
                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Growth Potential</p>
                  <p className="text-sm text-gray-600">Advance with us</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:pl-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-10">
              {!isSubmitted ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-yellow-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Truck className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Started Today</h3>
                    <p className="text-gray-600">Enter your contact number and we&apos;ll reach out to you!</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(416) 555-0123"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        maxLength={14}
                        className="w-full px-4 py-3 text-lg border-2 border-amber-100 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !phoneNumber.trim()}
                      className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-yellow-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <Truck className="w-5 h-5 mr-2" />
                          Join Us
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    We&apos;ll contact you within 24 hours to discuss opportunities.
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-6">
                    We&apos;ve received your application. Our team will contact you within 24 hours to discuss delivery partner opportunities.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="border-amber-200 text-amber-600 hover:bg-amber-50"
                  >
                    Submit Another Application
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
