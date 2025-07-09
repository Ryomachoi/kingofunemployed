import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-8 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-4xl">🦁</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              백수의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">왕</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              취업 준비생들이 모여 정보를 공유하고 함께 성장하는 커뮤니티
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 기업별 게시판 */}
          <Link href="/boards" className="group">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">기업별 게시판</h3>
              <div className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform duration-300">시작하기 →</div>
            </div>
          </Link>

          {/* 면접 복기 */}
          <Link href="/interview" className="group">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">면접 복기</h3>
              <div className="text-green-600 dark:text-green-400 font-medium group-hover:translate-x-2 transition-transform duration-300">경험 공유하기 →</div>
            </div>
          </Link>

          {/* 채용정보 */}
          <Link href="/jobs" className="group">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">채용정보</h3>
              <div className="text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-2 transition-transform duration-300">정보 보기 →</div>
            </div>
          </Link>
        </div>

        {/* 추천 기능들 (미구현) */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-12">곧 출시될 기능들</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 opacity-75">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">📊</span>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">취업 통계</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">업계별 취업률과 트렌드 분석</p>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 opacity-75">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🎯</span>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">맞춤 추천</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">개인별 맞춤 채용정보 추천</p>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 opacity-75">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">👥</span>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">스터디 그룹</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">함께 공부할 동료 찾기</p>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 opacity-75">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🏆</span>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">성취 시스템</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">활동 기반 포인트와 뱃지</p>
            </div>
          </div>
        </div>
      </div>

      {/* 디버그 버튼 - 오른쪽 하단 */}
      <Link href="/debug" className="fixed bottom-6 right-6 z-50 group">
        <div className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          디버그 모드
        </div>
      </Link>
    </div>
  )
}
