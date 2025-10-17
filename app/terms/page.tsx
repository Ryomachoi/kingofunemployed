export default function TermsPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">
            이용약관
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-base text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              본 약관은 백수의 왕(이하 '운영자')이 제공하는 AI 기반 면접 컨설팅 및 피드백 웹서비스(이하 '서비스')의 이용조건 및 절차에 관한 사항을 규정합니다.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제1조 목적
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                이 약관은 이용자가 운영자가 제공하는 서비스를 이용함에 있어 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제2조 서비스의 내용
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 본 서비스는 AI를 활용한 면접 피드백 및 취업 관련 컨설팅을 제공합니다.</li>
                <li>• 로그인하지 않아도 커뮤니티 게시글 조회는 가능하나, 글 작성 및 면접 기능 이용은 로그인 후에만 가능합니다.</li>
                <li>• 운영자는 서비스의 일부 또는 전부를 사전 공지 없이 변경하거나 중단할 수 있습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제3조 회원가입 및 로그인
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 이용자는 네이버 또는 카카오 계정을 이용하여 로그인할 수 있습니다.</li>
                <li>• 회원가입 과정에서 제공되는 정보는 개인정보처리방침에 따라 관리됩니다.</li>
                <li>• 이용자는 본인 명의의 계정만 사용해야 하며, 타인의 계정을 부정 사용해서는 안 됩니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제4조 이용자의 의무
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 mb-3">
                이용자는 다음 행위를 해서는 안 됩니다.
              </p>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 타인의 개인정보를 도용하거나 허위 정보를 입력하는 행위</li>
                <li>• 불법적이거나 비윤리적인 내용의 게시글 작성</li>
                <li>• 서비스 운영을 방해하는 행위</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제5조 운영자의 의무
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                운영자는 안정적인 서비스 제공을 위해 노력하며, 개인정보 보호법 등 관련 법령을 준수합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제6조 면책조항
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 본 서비스의 AI 피드백은 참고용으로 제공되며, 그 결과의 정확성·완전성·취업 결과 등에 대한 법적 책임을 지지 않습니다.</li>
                <li>• 이용자가 본 서비스를 이용하며 발생한 손해는 이용자 본인의 책임으로 합니다.</li>
                <li>• 운영자는 천재지변, 기술적 장애, 서버 문제 등 불가항력적 사유로 인한 손해에 대해 책임을 지지 않습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제7조 저작권 및 콘텐츠 관리
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 서비스 내 게시된 모든 콘텐츠(텍스트, 이미지, AI 피드백 결과 등)의 저작권은 운영자에게 귀속됩니다.</li>
                <li>• 이용자는 운영자의 사전 동의 없이 콘텐츠를 무단 복제, 배포, 상업적 이용할 수 없습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제8조 이용 제한 및 계정 해지
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                이용자가 본 약관을 위반하거나 서비스 운영에 지장을 주는 행위를 할 경우, 운영자는 이용자의 계정을 제한 또는 삭제할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제9조 연령 제한
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 본 서비스는 만 14세 이상 이용자만 사용할 수 있습니다.</li>
                <li>• 네이버 및 카카오 로그인 정책에 따라 만 14세 미만 사용자는 접근이 제한됩니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제10조 약관의 변경
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                본 약관은 서비스 운영 상황에 따라 변경될 수 있으며, 변경 시 서비스 내 공지사항을 통해 사전 안내합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                제11조 문의처
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 운영자: 백수의 왕</li>
                <li>• 이메일: glsh7733@gmail.com</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                부칙
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                본 약관은 2025년 10월 17일부터 시행합니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}