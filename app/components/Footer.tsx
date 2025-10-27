import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 py-6 bg-slate-100 dark:bg-slate-800">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 회사 소개 */}
          <div>
            <h3 className="font-semibold text-xs-plus mb-4 text-slate-900 dark:text-slate-100">백수의 왕</h3>
            <p className="text-xs-minus text-slate-600 dark:text-slate-400 leading-relaxed">
              면접에 최적화 된 전문 AI로 성공적인 취업을 도와드립니다.
            </p>
          </div>

          {/* 서비스 소개 */}
          <div>
            <h3 className="font-semibold text-xs-plus mb-4 text-slate-900 dark:text-slate-100">서비스 소개</h3>
            <ul className="space-y-2">
              <li className="text-xs-minus text-slate-600 dark:text-slate-400">
                • AI를 기반으로 한 면접 분석 및 개인 맞춤형 피드백을 제공합니다.
              </li>
              <li className="text-xs-minus text-slate-600 dark:text-slate-400">
                • 분석 내용은 언제든지 조회가 가능합니다.
              </li>
              <li className="text-xs-minus text-slate-600 dark:text-slate-400">
                • 게시판에서 면접과 취업 정보를 공유하고 확인할 수 있습니다.
              </li>
            </ul>
          </div>

          {/* 문의하기 */}
          <div>
            <h3 className="font-semibold text-xs-plus mb-4 text-slate-900 dark:text-slate-100">문의하기</h3>
            <p className="text-xs-minus text-slate-600 dark:text-slate-400 mb-1">
              서비스 이용에 관한 문의는 하단의 메일로 연락주세요!
            </p>
            <a 
              href="mailto:glsh7733@gmail.com"  
              className="text-xs-minus text-blue-600 dark:text-blue-400 hover:underline"
            >
              glsh7733@gmail.com
            </a>
          </div>
        </div>

        {/* 하단 정책 링크 및 저작권 */}
        <div className="mt-4 pt-4 pb-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center space-y-2 py-2">
            {/* 정책 링크 */}
            <div className="flex space-x-3">
              <Link href="/terms" className="text-xs-minus text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                이용 약관
              </Link>
              <Link href="/privacy" className="text-xs-minus text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                개인정보처리방침
              </Link>
            </div>
            {/* 저작권 */}
            <p className="text-xs-minus text-slate-500 dark:text-slate-500">
              © 2025 백수의 왕. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}