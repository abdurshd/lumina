import type { Metadata } from "next";
import { Instrument_Serif, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "@/components/ui/sonner";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumina — Discover Your Hidden Talents",
  description: "AI-powered talent discovery through multimodal analysis of your digital footprint",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${outfit.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster richColors position="bottom-right" />
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
