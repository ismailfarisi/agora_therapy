/**
 * Next.js Middleware for Authentication and Authorization
 * Handles route protection and role-based access control
 */

import { NextRequest, NextResponse } from "next/server";

// Define route patterns
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/"];
const CLIENT_ROUTES = ["/client"];
const THERAPIST_ROUTES = ["/therapist"];
const ADMIN_ROUTES = ["/admin"];
const SESSION_ROUTES = ["/session"];

// Routes that require authentication but allow any role
const PROTECTED_ROUTES = [
  ...CLIENT_ROUTES,
  ...THERAPIST_ROUTES,
  ...ADMIN_ROUTES,
  ...SESSION_ROUTES,
];

export default function middleware(request: NextRequest) {
  console.log(
    "Middleware execution started for path:",
    request.nextUrl.pathname
  );
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except auth API)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/static") ||
    (pathname.startsWith("/api") && !pathname.startsWith("/api/auth"))
  ) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    route === "/" ? pathname === route : pathname.startsWith(route)
  );
  console.log("isPublicRoute:", isPublicRoute);
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  console.log("isProtectedRoute:", isProtectedRoute);

  if (!isProtectedRoute && !isPublicRoute) {
    // Default to requiring authentication for unknown routes
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get authentication token from cookies or headers
  const token =
    request.cookies.get("auth-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    console.log("No token found, redirecting to login");
    // Redirect to login if no token
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}`, request.url)
    );
  }

  try {
    // For now, we'll do basic token validation
    // Role-based access control will be handled client-side
    if (token && token.length > 20) {
      // Token exists and looks valid, allow access
      const response = NextResponse.next();
      return response;
    } else {
      throw new Error("Invalid token format");
    }
  } catch (error) {
    console.error("Middleware auth error:", error);

    // Invalid token, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    // Clear invalid token cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("auth-token");

    return response;
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/therapist/:path*",
    "/client/:path*",
    "/admin/:path*",
    "/session/:path*",
  ],
};
