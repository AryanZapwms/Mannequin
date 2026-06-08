import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Checkout — Mannequin Care",
  description: "Complete your purchase securely. Free shipping on orders over ₹500.",
  robots: { index: false },
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
