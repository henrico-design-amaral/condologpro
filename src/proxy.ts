import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicConfig } from "@/lib/supabase/config";

function loginRedirect(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  if (reason) {
    url.searchParams.set("error", reason);
  }

  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const config = getSupabasePublicConfig();

  if (!config) {
    return loginRedirect(request, "auth-not-configured");
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      }
    }
  });

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return loginRedirect(request);
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/mobile/:path*"]
};
