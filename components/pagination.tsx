"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  /** Total number of items */
  total: number;
  /** Items per page */
  pageSize: number;
  /** Current page (1-based) */
  currentPage: number;
  /** URL search-param name for the page number (default: "page") */
  paramName?: string;
}

function buildUrl(
  pathname: string,
  params: URLSearchParams,
  page: number,
  paramName: string
) {
  const next = new URLSearchParams(params.toString());
  if (page === 1) {
    next.delete(paramName);
  } else {
    next.set(paramName, String(page));
  }
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function Pagination({
  total,
  pageSize,
  currentPage,
  paramName = "page",
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Generate visible page numbers with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-input bg-background px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";
  const activeClass = "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground";
  const ghostClass = "border-transparent bg-transparent";

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildUrl(pathname, searchParams, currentPage - 1, paramName)}
          className={cn(linkClass, ghostClass)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, ghostClass, "opacity-40")} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`ellipsis-${idx}`} className={cn(linkClass, ghostClass, "cursor-default")}>
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(pathname, searchParams, p, paramName)}
            className={cn(linkClass, p === currentPage ? activeClass : "")}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildUrl(pathname, searchParams, currentPage + 1, paramName)}
          className={cn(linkClass, ghostClass)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(linkClass, ghostClass, "opacity-40")} aria-disabled="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
