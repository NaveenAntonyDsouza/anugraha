import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/", "/about", "/privacy-policy", "/terms-of-service", "/help", "/success-stories", "/about-us/anugraha-matrimony", "/about-us/privacy-policy", "/about-us/terms-of-service"];
const authRoutes = ["/login", "/forgot-password", "/reset-password"];

// Registration step 1 is open to everyone; subsequent steps require auth
const protectedRegSteps = [
  "/register-free/step-two",
  "/register-free/step-three",
  "/register-free/step-four",
  "/register-free/final-step",
  "/register-free/mob-verification",
  "/register-free/email-verification",
  "/register-free/congratulation",
  "/register-free/additional-step-one",
  "/register-free/additional-step-two",
  "/register-free/partner-preference",
];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route)) {
    return supabaseResponse;
  }

  // Allow API routes
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  // Allow register-free step 1 for everyone
  if (pathname === "/register-free") {
    return supabaseResponse;
  }

  // Protect registration steps 2+ — require auth
  if (protectedRegSteps.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/register-free";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Redirect logged-in users away from auth routes (login, etc.)
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/my-home";
    return NextResponse.redirect(url);
  }

  // Protect onboarding routes — require auth
  if (!user && (pathname.startsWith("/upload-photos") || pathname.startsWith("/submit-id-proof"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Protect dashboard routes — require auth
  if (!user && (pathname.startsWith("/my-home") || pathname.startsWith("/user-info"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
