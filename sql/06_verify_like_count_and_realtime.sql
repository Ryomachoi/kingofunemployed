-- Supabase SQL Editor에서 실행하세요.
-- 목적: like_count가 post_likes 실제 개수와 일치하는지 확인하고, 최신 인기 게시글을 점검합니다.
SET search_path TO public;

-- 1) 특정 게시글의 like_count와 실제 post_likes 개수 비교
-- 아래 POST_ID_HERE에 실제 게시글 UUID를 넣으세요.
WITH params AS (
  SELECT '00000000-0000-0000-0000-000000000000'::uuid AS post_id
),
agg AS (
  SELECT post_id, COUNT(*) AS cnt
  FROM public.post_likes
  GROUP BY post_id
)
SELECT p.id, p.like_count, COALESCE(a.cnt, 0) AS actual_likes
FROM public.posts p
JOIN params ON p.id = params.post_id
LEFT JOIN agg a ON a.post_id = p.id;

-- 2) 최신 인기 게시글 목록 (좋아요 수 기준)
SELECT id, title, like_count, created_at
FROM public.posts
WHERE is_deleted = false
ORDER BY like_count DESC, created_at DESC
LIMIT 20;

-- 3) 최근 좋아요 활동 로그 (옵션)
SELECT post_id, user_id, created_at
FROM public.post_likes
ORDER BY created_at DESC
LIMIT 50;

-- 확인 메시지
SELECT 'verification queries executed' AS result;