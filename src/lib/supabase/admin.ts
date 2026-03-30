import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client with lazy initialization.
 * This prevents build-time errors when environment variables are missing.
 * Should ONLY be used in server-side code (API routes, Server Components, etc.).
 */
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // During Next.js build time, these might be missing.
    // We return a proxy or a dummy client that throws ONLY when used,
    // or just return null and let the caller handle it if they call it during build.
    // But ideally, this function is only called inside dynamic contexts.
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
       // In a real production environment, we'd want to know.
    }
    
    // Return a proxy that throws on any property access if key/url are missing
    return new Proxy({} as ReturnType<typeof createClient>, {
      get(_, prop) {
        throw new Error(
          `Supabase Admin client used but environment variables are missing (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY). ` +
          `Property accessed: ${String(prop)}. Ensure variables are set in Vercel.`
        );
      }
    });
  }

  return createClient(url, key);
}
