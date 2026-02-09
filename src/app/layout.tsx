import type { Metadata } from "next";
import { Playpen_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "@/components/ui/sonner";

const playpenSans = Playpen_Sans({
  variable: "--font-playpen-sans",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playpenSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
