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
          <form action={signup} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                이메일
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="input"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                비밀번호
              </label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="input"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit"
              className="btn btn-primary w-full"
            >
              회원가입
            </button>
          </form>
          
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