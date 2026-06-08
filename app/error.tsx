"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error monitoring service here (e.g. Sentry)
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mb-2 max-w-md text-base text-muted-foreground">
        An unexpected error occurred. Our team has been notified. You can try
        refreshing the page or head back to the homepage.
      </p>

      {/* Show digest for debugging (never shows raw error message in prod) */}
      {error.digest && (
        <p className="mb-6 text-xs text-muted-foreground/60">
          Error ID: <span className="font-mono">{error.digest}</span>
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </main>
  );
}
