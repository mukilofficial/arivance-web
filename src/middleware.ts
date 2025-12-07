import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "super-secret-key-change-this" });
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup");

    if (isAuthPage) {
        if (isAuth) {
            return NextResponse.redirect(new URL("/", req.url));
        }
        return null;
    }

    if (!isAuth && req.nextUrl.pathname.startsWith("/results")) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return null;
}

export const config = {
    matcher: ["/results/:path*", "/login", "/signup"],
};
