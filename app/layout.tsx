import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Mono, Jost, Nunito_Sans, Quicksand } from "next/font/google";
import Header from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import Preloader from "@/components/preloader/Preloader";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";
import Footer from "@/components/Footer";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://mannequincare.in";

const SITE_NAME = "Mannequin Care";
const SITE_DESCRIPTION =
  "Mannequin Care is India's Vitamin E skincare specialist — premium stretch mark repair, hair strengthening, and post-pregnancy care formulated for Indian skin tones.";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: `${SITE_NAME} | Vitamin E Skincare for Indian Women`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Mannequin Care",
    "Vitamin E skincare",
    "stretch mark repair",
    "hair strengthening oil",
    "post-pregnancy skincare",
    "Indian skincare brand",
    "Vitamin E hair oil",
    "skincare for Indian women",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Vitamin E Skincare for Indian Women`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Vitamin E Skincare for Indian Women`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${defaultUrl}/#organization`,
      name: SITE_NAME,
      url: defaultUrl,
      logo: `${defaultUrl}/logo.jpg`,
      description: SITE_DESCRIPTION,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${defaultUrl}/#website`,
      name: SITE_NAME,
      url: defaultUrl,
      publisher: { "@id": `${defaultUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${defaultUrl}/shop?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${jost.variable} ${nunitoSans.variable} ${dmMono.variable} ${quicksand.variable} font-body antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Preloader />
        <ToastProvider />
        <div className="fixed top-0 left-0 right-0 z-50">
          <AnnouncementBar />
          <Header />
        </div>
        <main className="min-h-screen bg-background pt-24 text-foreground md:pt-[108px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
