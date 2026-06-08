import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";
import Footer from "@/components/Footer";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Mannequin Care",
  description: "A mannequin care website for Stretch & Repair",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ToastProvider />
        <Header />
        <main className="min-h-screen bg-background pt-20 md:pt-24">{children}</main>
        <Footer/>
      </body>
    </html>
  );
}
