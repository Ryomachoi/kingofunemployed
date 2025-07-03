export default function MyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">마이페이지</h1>
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">내 게시글 관리</h2>
        <div className="rounded border p-4 bg-white dark:bg-slate-900">
          <p className="text-slate-500">작성한 게시글이 여기에 표시됩니다.</p>
          {/* 실제 게시글 리스트가 여기에 들어갑니다. */}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">내 댓글 관리</h2>
        <div className="rounded border p-4 bg-white dark:bg-slate-900">
          <p className="text-slate-500">작성한 댓글이 여기에 표시됩니다.</p>
          {/* 실제 댓글 리스트가 여기에 들어갑니다. */}
        </div>
      </section>
    </div>
  );
}