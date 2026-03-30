import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Create an unmodified response first
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Check gym access for all /dashboard routes (Bypass for platform owner)
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const isOwner = user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;
    
    if (!isOwner) {
      try {
        const { data: profile } = await supabase.from('profiles').select('gym_id').eq('id', user.id).single();
        if (profile?.gym_id) {
           const { checkGymAccess } = await import('@/lib/supabase/check-gym-access');
           await checkGymAccess(profile.gym_id);
        }
      } catch (res: any) {
        if (res instanceof Response) {
          const body = await res.json();
          const url = request.nextUrl.clone();
          url.pathname = '/pending';
          url.searchParams.set('reason', body.status || 'pending');
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
