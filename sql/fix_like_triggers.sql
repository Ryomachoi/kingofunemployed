-- 추천 기능 트리거 문제 해결을 위한 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. 기존 트리거 삭제 (혹시 문제가 있을 경우를 대비)
DROP TRIGGER IF EXISTS update_post_like_count_trigger ON post_likes;
DROP TRIGGER IF EXISTS update_comment_like_count_trigger ON comment_likes;

-- 2. 기존 함수 삭제 후 재생성
DROP FUNCTION IF EXISTS update_post_like_count() CASCADE;
DROP FUNCTION IF EXISTS update_comment_like_count() CASCADE;

-- 3. 게시글 추천 수 업데이트 함수 재생성
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. 댓글 추천 수 업데이트 함수 재생성
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. 트리거 재생성
CREATE TRIGGER update_post_like_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

CREATE TRIGGER update_comment_like_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- 6. 기존 게시글들의 like_count 재계산 (데이터 정합성 복구)
UPDATE posts 
SET like_count = (
  SELECT COUNT(*) 
  FROM post_likes 
  WHERE post_likes.post_id = posts.id
)
WHERE posts.is_deleted = false;

-- 7. 기존 댓글들의 like_count 재계산 (데이터 정합성 복구)
UPDATE comments 
SET like_count = (
  SELECT COUNT(*) 
  FROM comment_likes 
  WHERE comment_likes.comment_id = comments.id
)
WHERE comments.is_deleted = false;

SELECT 'Like triggers fixed successfully!' as result;