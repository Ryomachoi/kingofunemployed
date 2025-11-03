import { signup } from './actions'
import Link from 'next/link'

export default function SignupPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            회원가입
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            취업으로 가는 가장 빠른 길 '백수의 왕'
          </p>
        </div>
        
        <div className="card p-8">
          {/* 소셜 로그인 안내 */}
          <div className="text-center space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-800 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                소셜 로그인으로 간편하게 가입하세요
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                현재 이메일 회원가입은 중단되었습니다.<br/>
                카카오 로그인을 통해 빠르고 안전하게 가입할 수 있습니다.
              </p>
            </div>
            
            <Link 
              href="/login" 
              className="btn btn-primary w-full inline-flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l1.47-3.576C2.661 16.174 1.5 14.264 1.5 11.185 1.5 6.665 6.201 3 12 3Z"/>
              </svg>
              카카오로 로그인하기
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              이미 계정이 있으신가요?{' '}
              <Link 
                href="/" 
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                로그인
              </Link>
            </p>
          </div>
          
          {searchParams.message && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{searchParams.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}