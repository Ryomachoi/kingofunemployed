import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-4">
          <span className="text-white font-bold text-3xl">🦁</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">백수의 왕</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          취업 준비생을 위한 커뮤니티, 정보 공유와 성장의 공간입니다.
        </p>
        <div className="flex flex-col gap-4 mt-8">
          <Link href="/qna" className="btn btn-outline w-full">Q&A</Link>
          <Link href="/interview" className="btn btn-outline w-full">면접 복기</Link>
          <Link href="/jobs" className="btn btn-outline w-full">채용정보</Link>
        </div>
      </div>
    </div>
  )
}
