import "./globals.css";
import { defaultMetadata } from "@/lib/metadata";
import { LayoutClient } from "./layout-client";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"], // expanded weights
});

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon-192x192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF8C00" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
