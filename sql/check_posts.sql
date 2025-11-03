-- 게시글 데이터 확인
SELECT 
  p.id,
  p.title,
  p.like_count,
  p.board_id,
  p.author_id,
  p.created_at,
  b.name as board_name
FROM posts p
JOIN boards b ON p.board_id = b.id
WHERE p.is_deleted = false
ORDER BY p.created_at DESC
LIMIT 10;

-- 특정 게시판의 게시글 확인
SELECT 
  id,
  title,
  like_count,
  created_at
FROM posts 
WHERE board_id = '35678108-6efd-4f79-bf11-7aa16fbe8f31'
  AND is_deleted = false
ORDER BY created_at DESC;

-- post_likes 테이블 확인
SELECT 
  pl.post_id,
  pl.user_id,
  pl.created_at,
  p.title,
  p.like_count
FROM post_likes pl
JOIN posts p ON pl.post_id = p.id
ORDER BY pl.created_at DESC
LIMIT 10;