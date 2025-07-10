-- 모든 게시판의 post_count를 실제 게시물 수로 재계산하는 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 각 게시판별로 실제 게시물 수를 계산하여 post_count 업데이트
UPDATE boards 
SET post_count = (
  SELECT COUNT(*) 
  FROM posts 
  WHERE posts.board_id = boards.id 
    AND posts.is_deleted = false
);

-- 결과 확인
SELECT 
  b.id,
  b.name,
  b.post_count,
  (
    SELECT COUNT(*) 
    FROM posts p 
    WHERE p.board_id = b.id 
      AND p.is_deleted = false
  ) as actual_post_count
FROM boards b
ORDER BY b.name;

SELECT 'Post count has been recalculated for all boards.' as result;