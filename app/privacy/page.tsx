export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">
            개인정보처리방침
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-base text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              백수의 왕(이하 '운영자')은 「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 
              이와 관련한 고충을 신속하고 원활하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
            
            <p className="text-base text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
              본 방침은 서비스 운영 목적이 비영리적 개인 프로젝트인 경우에도 적용됩니다.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                1. 개인정보의 수집 항목 및 방법
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 mb-3">
                운영자는 다음의 개인정보를 수집합니다.
              </p>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 mb-4">
                <li>• 네이버 및 카카오 로그인 시 수집 항목: 이메일, 이름, 프로필 이미지, 로그인 식별자 등</li>
                <li>• 면접 피드백 이용 시 수집 항목: 사용자가 입력한 면접 답변, AI 분석 결과, 피드백 내용</li>
                <li>• 커뮤니티 이용 시: 게시글, 댓글, 닉네임, 작성 시각 등</li>
                <li>• 자동 수집 항목: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보 등(통계 분석 목적)</li>
              </ul>
              <p className="text-base text-slate-700 dark:text-slate-300">
                개인정보는 이용자가 직접 입력하거나 제3자 로그인 연동을 통해 자동으로 수집됩니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                2. 개인정보의 이용 목적
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 mb-3">
                수집한 개인정보는 다음의 목적을 위해 이용됩니다.
              </p>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 회원 식별 및 로그인 관리</li>
                <li>• AI 기반 면접 피드백 제공 및 커뮤니티 운영</li>
                <li>• 서비스 개선을 위한 통계 및 분석</li>
                <li>• 이용자 문의 응대 및 보안 관리</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                3. 개인정보의 보관 및 파기
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 개인정보는 회원 탈퇴 시 즉시 삭제됩니다.</li>
                <li>• 단, 법령에서 일정 기간 보존을 요구하는 경우 해당 기간 동안 안전하게 보관 후 파기합니다.</li>
                <li>• 서버 DB에 저장된 데이터는 암호화되어 보관됩니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                4. 개인정보의 제3자 제공
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                운영자는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 
                다만, 이용자의 동의가 있거나 법령에 근거한 요청이 있을 경우 예외적으로 제공할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                5. 개인정보 처리의 위탁
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                현재 개인정보 처리 업무를 외부 업체에 위탁하지 않습니다. 
                향후 위탁이 필요한 경우, 사전에 이용자에게 고지하고 동의를 받겠습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                6. 이용자 및 법정대리인의 권리
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 이용자는 언제든지 본인의 개인정보를 조회, 수정, 삭제할 수 있습니다.</li>
                <li>• 만 14세 미만 아동은 본 서비스를 이용할 수 없습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                7. 쿠키(Cookie) 및 통계 도구의 사용
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 운영자는 서비스 품질 향상 및 이용 통계를 위해 쿠키와 웹 분석 도구를 사용할 수 있습니다.</li>
                <li>• 쿠키 사용은 브라우저 설정을 통해 거부할 수 있습니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                8. 개인정보의 안전성 확보 조치
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300 mb-3">
                운영자는 다음과 같은 조치를 통해 개인정보를 안전하게 관리합니다.
              </p>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 개인정보 접근권한 최소화</li>
                <li>• 암호화 저장 및 전송</li>
                <li>• 주기적인 보안 점검 및 백업 관리</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                9. 개인정보 보호책임자 및 문의처
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300 mb-4">
                <li>• 책임자: 백수의 왕</li>
                <li>• 이메일: glsh7733@gmail.com</li>
              </ul>
              <p className="text-base text-slate-700 dark:text-slate-300">
                개인정보 관련 문의나 삭제 요청은 위 이메일로 접수하실 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                10. 고지 및 시행일
              </h2>
              <ul className="space-y-2 text-base text-slate-700 dark:text-slate-300">
                <li>• 본 개인정보처리방침은 2025년 10월 17일부터 시행됩니다.</li>
                <li>• 변경 사항이 있을 경우 서비스 내 공지사항을 통해 고지합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                호스팅 정보
              </h2>
              <p className="text-base text-slate-700 dark:text-slate-300">
                (추후 기재 예정)
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}