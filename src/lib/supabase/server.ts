import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabasePublicConfig } from "@/lib/supabase/config";

export async function createSupabaseServerClient() {
  const config = requireSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. src/proxy.ts handles refreshes.
        }
      }
    }
  });
}
