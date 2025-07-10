-- 추천 관련 테이블과 컬럼 완전 삭제

-- 1. 추천 테이블 삭제
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;

-- 2. posts 테이블에서 like_count 컬럼 삭제
ALTER TABLE posts DROP COLUMN IF EXISTS like_count;

-- 3. comments 테이블에서 like_count 컬럼 삭제
ALTER TABLE comments DROP COLUMN IF EXISTS like_count;

-- 4. 추천 관련 인덱스가 있다면 삭제 (혹시 모를 경우를 대비)
DROP INDEX IF EXISTS idx_post_likes_post_id;
DROP INDEX IF EXISTS idx_post_likes_user_id;
DROP INDEX IF EXISTS idx_comment_likes_comment_id;
DROP INDEX IF EXISTS idx_comment_likes_user_id;