"use client";

import React from "react";
import { UserAuthFlow } from "@/components/auth/UserAuthFlow";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/userStore";
import { Shield, Zap, Heart, ArrowLeft, Phone, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();

  return (
    <>
      {/* Hero Background with Enhanced Design */}
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-25 to-amber-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10"></div>
        </div>

        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-200 font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left Column - Sign In Form */}
              <div className="w-full max-w-md mx-auto lg:order-1">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10">
                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-200">
                      <Phone className="w-8 h-8 text-yellow-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Sign In to Your Account
                    </h2>
                    <p className="text-gray-600">
                      Enter your phone number to get started
                    </p>
                  </div>

                  {/* Auth Flow */}
                  <div className="space-y-6">
                    <UserAuthFlow
                      onSuccess={(user) => {
                        userStore.getState().setPhone(user.phone);
                        userStore.getState().setUser(user);
                        router.push("/");
                      }}
                    />
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Secure Login</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>No Spam</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span>Privacy Protected</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    New to Nalan Batters?{" "}
                    <span className="font-medium text-yellow-700">
                      We&apos;ll help you create an account during sign-up!
                    </span>
                  </p>
                </div>
              </div>

              {/* Right Column - Branding & Features */}
              <div className="text-center lg:text-right space-y-8 lg:order-2">
                {/* Logo and Brand */}
                <div className="space-y-6">
                  <div className="flex justify-center lg:justify-end">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl flex items-center justify-center shadow-xl">
                      <span className="text-3xl">🥥</span>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                      Welcome to
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                        Nalan Batters
                      </span>
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0 lg:ml-auto">
                      Experience the authentic taste of traditional South Indian batters,
                      crafted with love and delivered fresh to your doorstep.
                    </p>
                  </div>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
                    <p className="text-sm text-gray-600">Safe & protected authentication</p>
                  </div>

                  <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Fast</h3>
                    <p className="text-sm text-gray-600">Quick delivery to your door</p>
                  </div>

                  <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Fresh</h3>
                    <p className="text-sm text-gray-600">Made with traditional recipes</p>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="flex justify-center lg:justify-end items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                  <span className="font-medium">4.9/5 from 500+ customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
