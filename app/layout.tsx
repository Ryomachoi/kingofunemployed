import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { createClient } from '@/lib/supabase/server';
import { logout } from './login/actions';
import { AuthProvider } from '@/contexts/AuthContext';

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
          <div className="container flex h-16 items-center">
            {/* 로고 */}
            <div className="flex items-center space-x-2 mr-8">
              <div className="h-10 w-10 flex items-center justify-center">
                <span className="text-2xl font-bold">🦁</span>
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-slate-100">백수의 왕</span>
            </div>
            
            {/* 메인 메뉴 - 로고 바로 오른쪽 */}
            <div className="flex items-center space-x-8 flex-1">
              <Link href="/boards" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                게시판
              </Link>
              <Link href="/interviews" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                면접
              </Link>
              <Link href="/jobs" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                채용정보
              </Link>
              <Link href="/mypage" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                마이페이지
              </Link>
            </div>
            
            {/* 로그인/로그아웃 - 오른쪽 끝 */}
            <nav className="flex items-center space-x-3">
              {user ? (
                <form action={logout}>
                  <button
                    type="submit"
                    className="group relative px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md active:scale-95"
                  >
                    <span className="relative z-10">로그아웃</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  </button>
                </form>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="group relative px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md active:scale-95"
                  >
                    <span className="relative z-10">로그인</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  </Link>
                  <Link
                    href="/signup"
                    className="group relative px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 rounded-lg hover:from-slate-800 hover:to-slate-700 dark:hover:from-slate-200 dark:hover:to-slate-300 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 shadow-sm"
                  >
                    <span className="relative z-10">회원가입</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        
        <main className="flex-1">
          <AuthProvider>
            {children}
          </AuthProvider>
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
