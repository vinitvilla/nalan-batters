"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";
import { SessionHydrator } from "@/components/SessionHydrator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isSiginIn = pathname.startsWith("/signin") || pathname.startsWith("/signup");
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionHydrator />
        <div id="recaptcha-container" style={{ position: "absolute", zIndex: -1 }} />
        { !(isAdmin || isSiginIn) && <Header />}
        <Toaster />
        {children}
      </body>
    </html>
  );
}
