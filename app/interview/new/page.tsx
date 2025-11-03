"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createInterview } from "../actions";

export default function NewInterviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">페이지를 사용할 수 없습니다</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">이 페이지는 현재 비활성화되어 있습니다.</p>
        <Link 
          href="/interview/community"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          커뮤니티로 돌아가기
        </Link>
      </div>
    </div>
  );
}