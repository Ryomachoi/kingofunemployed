-- Supabase SQL Editor에서 실행하세요
-- 목적: 좋아요 시스템 점검(인기 게시글, 특정 게시글 좋아요 내역, 최신 글)
-- 참고: Supabase SQL Editor는 ":post_id" 형태의 바인딩을 지원하지 않으므로
-- 실제 post_id를 아래 WITH 절 또는 직접 WHERE에 입력해야 합니다.
SET search_path TO public;

-- 1) 인기 게시글 확인 (좋아요 수 기준)
SELECT id, title, like_count, created_at
FROM public.posts
WHERE is_deleted = false
ORDER BY like_count DESC, created_at DESC
LIMIT 20;

-- 2) 특정 게시글의 좋아요 현황
-- 아래 'POST_ID_HERE'에 실제 게시글 ID(UUID)를 입력하세요
WITH params AS (
  SELECT '00000000-0000-0000-0000-000000000000'::uuid AS post_id
)
SELECT pl.user_id, pl.created_at
FROM public.post_likes pl
JOIN params ON pl.post_id = params.post_id
ORDER BY pl.created_at DESC;

-- 또는 직접 값 사용 예시:
-- SELECT pl.user_id, pl.created_at
-- FROM public.post_likes pl
-- WHERE pl.post_id = '00000000-0000-0000-0000-000000000000'::uuid
-- ORDER BY pl.created_at DESC;

-- 3) 최신 작성글 목록(좋아요 수 포함)
SELECT p.id, p.title, p.like_count, p.created_at
FROM public.posts p
WHERE p.is_deleted = false
ORDER BY p.created_at DESC
LIMIT 20;