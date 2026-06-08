import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Wishlist — Mannequin Care",
  description: "Save your favourite products and add them to your cart when you're ready.",
  robots: { index: false },
};

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
