import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Batas tunggu tiap panggilan ke Supabase dari middleware.
// Vercel memutus middleware di ~25 detik; kita jangan pernah sampai ke sana.
const SUPABASE_TIMEOUT_MS = 3000;

// Jalankan sebuah promise dengan batas waktu. Kalau lewat batas atau error,
// kembalikan nilai cadangan supaya middleware tidak pernah menggantung.
function withTimeout(thenable, ms, fallback) {
  let timer;
  const guarded = Promise.resolve(thenable).catch(() => fallback);
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([guarded, timeout]).finally(() => clearTimeout(timer));
}

function hasSupabaseSessionCookie(request) {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'));
}

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const isLogin = path === '/login';

  let response = NextResponse.next({ request });

  const toLogin = () =>
    isLogin ? response : NextResponse.redirect(new URL('/login', request.url));

  // Tanpa cookie sesi tidak ada gunanya menghubungi Supabase sama sekali.
  if (!hasSupabaseSessionCookie(request)) return toLogin();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Env var belum terpasang: jangan coba fetch ke URL kosong.
  if (!url || !anonKey) return toLogin();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const userResult = await withTimeout(supabase.auth.getUser(), SUPABASE_TIMEOUT_MS, {
    data: { user: null },
  });
  const user = userResult?.data?.user ?? null;

  // Termasuk kasus Supabase mati / lambat: perlakukan sebagai belum login.
  if (!user) return toLogin();

  const profileResult = await withTimeout(
    supabase.from('profiles').select('role').eq('id', user.id).single(),
    SUPABASE_TIMEOUT_MS,
    { data: null }
  );
  const role = profileResult?.data?.role;

  // Role tidak terbaca (database bermasalah). Jangan gantung dan jangan
  // redirect berputar - lepaskan request ke halaman, biar halaman yang
  // menampilkan errornya.
  if (!role) return response;

  if (isLogin || path === '/') {
    return NextResponse.redirect(
      new URL(role === 'mentor' ? '/dashboard' : '/peserta', request.url)
    );
  }
  if (path.startsWith('/dashboard') && role !== 'mentor') {
    return NextResponse.redirect(new URL('/peserta', request.url));
  }
  if (path.startsWith('/peserta') && role !== 'peserta') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Lewati aset statis, gambar, dan file publik - middleware tidak perlu jalan di sana.
    '/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf)$).*)',
  ],
};
