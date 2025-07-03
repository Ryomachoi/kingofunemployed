import { login } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">로그인</h2>
        </div>
        <div className="card p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">이메일</label>
              <input id="email" name="email" type="email" required className="input" placeholder="your@email.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">비밀번호</label>
              <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
            </div>
            <button formAction={login} className="btn btn-primary w-full">로그인</button>
            <a href="/signup" className="btn btn-secondary w-full mt-2">회원가입</a>
          </form>
        </div>
      </div>
    </div>
  )
}