import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: "Arivance | Premium Lead Finder",
  description: "Find your perfect business leads with AI-powered precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(outfit.variable, syne.variable, "font-sans antialiased bg-[#0f172a] text-white")}>
        <Providers>
          <Navbar />
          <div className="pt-16">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
