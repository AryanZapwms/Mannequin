import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

const protectedRoutes = ["/account", "/checkout", "/admin", "/order-confirmation"];

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
