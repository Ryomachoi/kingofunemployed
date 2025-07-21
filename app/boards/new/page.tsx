"use client";
import React, { useState } from "react";
import { createBoard } from "../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewBoardPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    try {
      const result = await createBoard(formData);
      if (result?.error) {
        setError(result.error);
      }
      // 성공 시 redirect가 자동으로 처리됨
    } catch (err) {
      setError("게시판 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/boards"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            게시판 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            새 게시판 만들기
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            관심 있는 기업의 게시판을 만들어 정보를 공유해보세요
          </p>
        </div>

        {/* 폼 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 오류 메시지 */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 dark:text-red-200 text-sm font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  기업명 *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 삼성전자, 네이버, 카카오"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
                  maxLength={100}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {name.length}/100자
                </p>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  카테고리
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="">카테고리 선택</option>
                  <option value="대기업">대기업</option>
                  <option value="중견기업">중견기업</option>
                  <option value="중소기업">중소기업</option>
                  <option value="스타트업">스타트업</option>
                  <option value="공기업">공기업</option>
                  <option value="외국계">외국계</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  업종
                </label>
                <select
                  id="industry"
                  name="industry"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="">업종 선택</option>
                  <option value="IT/소프트웨어">IT/소프트웨어</option>
                  <option value="제조업">제조업</option>
                  <option value="금융업">금융업</option>
                  <option value="서비스업">서비스업</option>
                  <option value="유통/물류">유통/물류</option>
                  <option value="건설업">건설업</option>
                  <option value="의료/제약">의료/제약</option>
                  <option value="교육">교육</option>
                  <option value="미디어/엔터테인먼트">미디어/엔터테인먼트</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label htmlFor="job_category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  직무
                </label>
                <select
                  id="job_category"
                  name="job_category"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="">직무 선택</option>
                  <option value="개발/프로그래밍">개발/프로그래밍</option>
                  <option value="기획/PM">기획/PM</option>
                  <option value="디자인">디자인</option>
                  <option value="마케팅">마케팅</option>
                  <option value="영업">영업</option>
                  <option value="인사/HR">인사/HR</option>
                  <option value="재무/회계">재무/회계</option>
                  <option value="운영/관리">운영/관리</option>
                  <option value="연구개발">연구개발</option>
                  <option value="생산/제조">생산/제조</option>
                  <option value="품질관리">품질관리</option>
                  <option value="고객서비스">고객서비스</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="headquarters_location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  본사 위치
                </label>
                <input
                  type="text"
                  id="headquarters_location"
                  name="headquarters_location"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
                  placeholder="예: 서울특별시 강남구"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  웹사이트
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
                  placeholder="https://example.com (선택사항)"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                게시판 설명
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이 게시판에서 어떤 정보를 공유할지 간단히 설명해주세요 (선택사항)"
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors resize-none"
                maxLength={500}
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {description.length}/500자
              </p>
            </div>

            {/* 태그 */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                태그
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
                placeholder="태그1, 태그2, 태그3 (쉼표로 구분)"
                disabled={isSubmitting}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">최대 10개까지 입력 가능</p>
            </div>

            {/* 로고 아이콘 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                로고 아이콘
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { value: '🏢', label: '빌딩' },
                  { value: '🏭', label: '제조' },
                  { value: '💼', label: '서비스' },
                  { value: '💻', label: 'IT/테크' },
                  { value: '🏦', label: '금융' },
                  { value: '🏥', label: '의료' },
                  { value: '🎓', label: '교육' },
                  { value: '🛒', label: '유통' },
                  { value: '🚚', label: '물류' },
                  { value: '🎨', label: '창작' },
                  { value: '📱', label: '모바일' },
                  { value: '🔧', label: '기술' },
                  { value: '📊', label: '분석' },
                  { value: '🌐', label: '글로벌' },
                  { value: '⚡', label: '에너지' },
                  { value: '🎯', label: '마케팅' },
                  { value: '🔒', label: '보안' },
                  { value: '🚀', label: '스타트업' }
                ].map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setSelectedIcon(icon.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      selectedIcon === icon.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                    title={icon.label}
                    disabled={isSubmitting}
                  >
                    <span className="text-2xl">{icon.value}</span>
                  </button>
                ))}
              </div>
              <input
                 type="hidden"
                 name="logo_icon"
                 id="logo_icon"
                 value={selectedIcon}
               />
             </div>

            <div>
              <label htmlFor="community_rules" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                커뮤니티 규칙
              </label>
              <textarea
                id="community_rules"
                name="community_rules"
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors resize-none"
                placeholder="이 커뮤니티의 규칙과 가이드라인을 입력해주세요"
                disabled={isSubmitting}
              />
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-blue-800 dark:text-blue-200 text-sm">
                  <p className="font-medium mb-1">게시판 생성 안내</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 동일한 기업명의 게시판은 중복 생성할 수 없습니다</li>
                    <li>• 생성된 게시판은 모든 사용자가 볼 수 있습니다</li>
                    <li>• 부적절한 게시판은 관리자에 의해 삭제될 수 있습니다</li>
                    <li>• 로고 아이콘과 태그는 게시판 메인화면에 표시됩니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              <Link
                href="/boards"
                className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    생성 중...
                  </>
                ) : (
                  "게시판 만들기"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            게시판을 만든 후에는 해당 게시판에서 게시글을 작성하고 다른 사용자들과 정보를 공유할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}