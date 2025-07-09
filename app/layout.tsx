import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { createClient } from '@/lib/supabase/server';
import { logout } from './login/actions';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "백수의 왕 - 취업 커뮤니티",
  description: "취업 준비생들을 위한 면접 리뷰, 채용 정보 커뮤니티",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 dark:bg-slate-950`}
      >
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-700 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 flex items-center justify-center">
                <span className="text-2xl font-bold">🦁</span>
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-slate-100">백수의 왕</span>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link href="/interview" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                면접
              </Link>
              <Link href="/jobs" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                채용정보
              </Link>
              
              {user ? (
                <>
                  <Link href="/mypage" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                    마이페이지
                  </Link>
                  <form action={logout} className="inline">
                    <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer">
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                    로그인
                  </Link>
                  <Link href="/signup" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="border-t border-slate-200 dark:border-slate-700 py-8">
          <div className="container text-center text-sm text-slate-600 dark:text-slate-400">
            © 2024 백수의 왕. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
