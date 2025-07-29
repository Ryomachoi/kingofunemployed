"use client";
import React, { useState } from "react";
import { createBoard } from "../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";



export default function NewBoardPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [headquartersLocation, setHeadquartersLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [tags, setTags] = useState("");
  const [communityRules, setCommunityRules] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [logoType, setLogoType] = useState<'image' | 'icon'>('icon');
  const [selectedIcon, setSelectedIcon] = useState('🏢');
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const iconOptions = ['🏢', '🏭', '💼', '🏪', '🏬', '🏦', '🏛️', '🏗️', '⚡', '💻', '📱', '🚀', '💡', '🔧', '⚙️', '📊', '💰', '🎯', '🌟', '🔥'];
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    
    // 카테고리, 업종, 직무 정보 추가
    if (category) formData.append("category", category);
    if (industry) formData.append("industry", industry);
    if (jobCategory) formData.append("job_category", jobCategory);
    if (headquartersLocation) formData.append("headquarters_location", headquartersLocation);
    if (website) formData.append("website", website);
    if (tags) formData.append("tags", tags);
    if (communityRules) formData.append("community_rules", communityRules);
    

    
    // 로고 정보 추가
    if (logoType === 'image' && logoImage) {
      formData.append("logo_image", logoImage);
    } else if (logoType === 'icon') {
      formData.append("logo_icon", selectedIcon);
    }
    
    // 배너 이미지 추가 (선택사항)
    if (bannerImage) formData.append("banner_image", bannerImage);

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
                  name="name"
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
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
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
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
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
                  value={headquartersLocation}
                  onChange={(e) => setHeadquartersLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
                  placeholder="서울특별시 강남구 (선택사항)"
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
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
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
                name="description"
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
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 transition-colors"
                  placeholder="태그1, 태그2, 태그3 (쉼표로 구분)"
                  disabled={isSubmitting}
                />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">최대 10개까지 입력 가능</p>
            </div>

            {/* 로고 선택 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                로고 선택 (필수)
              </label>
              
              {/* 로고 타입 선택 */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setLogoType('image')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    logoType === 'image'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                  disabled={isSubmitting}
                >
                  이미지 업로드
                </button>
                <button
                  type="button"
                  onClick={() => setLogoType('icon')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    logoType === 'icon'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                  disabled={isSubmitting}
                >
                  아이콘 선택
                </button>
              </div>

              {/* 이미지 업로드 */}
              {logoType === 'image' && (
                <div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoImage(file);
                          const reader = new FileReader();
                          reader.onload = (e) => setLogoPreview(e.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300 dark:hover:file:bg-blue-900/30"
                      disabled={isSubmitting}
                    />
                    {logoPreview && (
                      <div className="flex-shrink-0">
                        <img
                          src={logoPreview}
                          alt="로고 미리보기"
                          className="w-16 h-16 object-contain rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    정사각형 이미지 권장 (최대 5MB, JPG/PNG/WebP)
                  </p>
                </div>
              )}

              {/* 아이콘 선택 */}
              {logoType === 'icon' && (
                <div>
                  <div className="grid grid-cols-6 gap-3 mb-3">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-colors ${
                          selectedIcon === icon
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                            : 'border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600'
                        }`}
                        disabled={isSubmitting}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    아이콘을 선택하세요
                  </p>
                </div>
              )}
            </div>

             {/* 배너 이미지 업로드 */}
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                 배너 이미지 업로드 (선택사항)
               </label>
               <div className="space-y-4">
                 <input
                   type="file"
                   accept="image/*"
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       setBannerImage(file);
                       const reader = new FileReader();
                       reader.onload = (e) => setBannerPreview(e.target?.result as string);
                       reader.readAsDataURL(file);
                     }
                   }}
                   className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300 dark:hover:file:bg-blue-900/30"
                   disabled={isSubmitting}
                 />
                 {/* 배너 미리보기 - 배경 이미지로 표시 */}
                 <div className="relative w-full h-32 rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden">
                   {bannerPreview ? (
                     <>
                       <div 
                         className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                         style={{ backgroundImage: `url(${bannerPreview})` }}
                       />
                       <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                         <div className="bg-white/90 dark:bg-slate-800/90 px-3 py-1 rounded-lg">
                           <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                             배너 미리보기
                           </span>
                         </div>
                       </div>
                     </>
                   ) : (
                     <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                       <div className="text-center">
                         <svg className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                         <span className="text-sm text-slate-500 dark:text-slate-400">
                           배너 이미지 미리보기
                         </span>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                 가로형 이미지 권장 (16:9 비율, 최대 10MB)
               </p>
             </div>

            <div>
              <label htmlFor="community_rules" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                커뮤니티 규칙
              </label>
              <textarea
                  id="community_rules"
                  name="community_rules"
                  value={communityRules}
                  onChange={(e) => setCommunityRules(e.target.value)}
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