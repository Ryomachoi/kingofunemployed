"use client";
import React, { useState } from "react";
import { createBoard } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBoardPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());

      const result = await createBoard(formData);
      
      if (result?.error) {
        setError(result.error);
        console.error('게시판 생성 실패:', result.error);
      } else if (result?.success) {
        // 성공시 게시판 목록으로 리다이렉트
        router.push("/boards");
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } catch (err) {
      setError("게시판 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
          <Link href="/boards" className="hover:text-slate-900 dark:hover:text-slate-100">
            게시판
          </Link>
          <span>›</span>
          <span>새 게시판 만들기</span>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          새 게시판 만들기
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          새로운 기업 게시판을 생성하여 정보를 공유해보세요
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              기업명 *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              placeholder="예: 삼성전자, 네이버, 카카오 등"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {name.length}/100자 (중복된 기업명은 사용할 수 없습니다)
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              게시판 설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="이 게시판에서 어떤 정보를 공유할지 간단히 설명해주세요 (선택사항)"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {description.length}/500자
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              게시판 생성 안내
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• 기업명은 중복될 수 없으며, 생성 후 수정이 어려우니 신중히 입력해주세요</li>
              <li>• 게시판은 모든 사용자가 조회할 수 있지만, 게시글 작성은 로그인한 사용자만 가능합니다</li>
              <li>• 부적절한 내용의 게시판은 관리자에 의해 삭제될 수 있습니다</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link
              href="/boards"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              취소
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "생성 중..." : "게시판 만들기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}