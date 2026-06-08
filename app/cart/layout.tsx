import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Shopping Cart — Mannequin Care",
  description: "Review the items in your cart before proceeding to checkout.",
  robots: { index: false },
};

export default function CartLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
