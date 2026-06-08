import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found — Mannequin Care",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      {/* Decorative number */}
      <div className="relative mb-6 select-none">
        <span className="text-[10rem] font-extrabold leading-none tracking-tighter text-muted/30 sm:text-[14rem]">
          404
        </span>
        <SearchX className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>

      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-base text-muted-foreground">
        We couldn't find the page you were looking for. It may have been moved,
        deleted, or the URL might be wrong.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Products
          </Link>
        </Button>
      </div>

      {/* Quick links */}
      <div className="mt-12 space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Popular pages
        </p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {[
            { label: "Shop", href: "/shop" },
            { label: "Blog", href: "/blog" },
            { label: "About Us", href: "/about-us" },
            { label: "Contact", href: "/contact-us" },
            { label: "Wishlist", href: "/wishlist" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-primary underline-offset-4 hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
