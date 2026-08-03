import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

// `/checkout` and `/order-confirmation` are intentionally absent. Visitors
// without an account reach checkout, then create one inline before paying;
// ownership on the confirmation page is enforced in the order API instead.
const protectedRoutes = ["/account", "/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!req.auth?.user && isProtectedRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
