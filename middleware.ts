import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    const discordId = session.user.user_metadata?.provider_id ||
                      session.user.identities?.find((i: any) => i.provider === 'discord')?.identity_data?.provider_id

    if (!discordId) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/auth?error=no_discord', request.url))
    }

    const { data: dbUser } = await supabase
      .from('users')
      .select('id, is_banned')
      .eq('discord_id', discordId)
      .single()

    if (!dbUser) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/auth?error=not_registered', request.url))
    }

    if (dbUser.is_banned) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/auth?error=banned', request.url))
    }
  }

  if (pathname === '/auth' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth'],
}