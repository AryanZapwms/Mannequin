"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  total: number;
  pageSize: number;
  currentPage: number;
  paramName?: string;
}

function buildUrl(
  pathname: string,
  params: URLSearchParams,
  page: number,
  paramName: string,
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

  const pages: (number | "…")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push("…");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("…");
    }

    pages.push(totalPages);
  }

  const linkClass =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-[#f5c400] hover:bg-[#fff8d6] hover:text-black";

  const activeClass =
    "border-[#f5c400] bg-[#f5c400] text-black shadow-sm hover:bg-[#f5c400] hover:text-black";

  const disabledClass =
    "pointer-events-none opacity-40";

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildUrl(
            pathname,
            searchParams,
            currentPage - 1,
            paramName,
          )}
          className={cn(linkClass)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(linkClass, disabledClass)}
          aria-disabled="true"
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Pages */}
      {pages.map((p, idx) =>
        p === "…" ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex h-10 min-w-10 items-center justify-center text-gray-400"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(
              pathname,
              searchParams,
              p,
              paramName,
            )}
            className={cn(
              linkClass,
              p === currentPage && activeClass,
            )}
            aria-current={
              p === currentPage ? "page" : undefined
            }
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildUrl(
            pathname,
            searchParams,
            currentPage + 1,
            paramName,
          )}
          className={cn(linkClass)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(linkClass, disabledClass)}
          aria-disabled="true"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}