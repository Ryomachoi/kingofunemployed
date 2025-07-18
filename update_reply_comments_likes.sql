-- 대댓글 좋아요 기능을 위한 데이터베이스 스키마 업데이트
-- Supabase 대시보드의 SQL Editor에서 실행하세요
-- 이 스크립트는 add_reply_comments.sql 실행 후에 실행해야 합니다

-- 1. comments 테이블에 parent_comment_id 컬럼 추가 (이미 add_reply_comments.sql에서 추가됨)
-- ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- 2. comment_likes 테이블의 RLS 정책 업데이트 (대댓글 포함)
DROP POLICY IF EXISTS "Users can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;
DROP POLICY IF EXISTS "Users can unlike their own comment likes" ON comment_likes;

-- 댓글 좋아요 조회 정책 (대댓글 포함)
CREATE POLICY "Users can view comment likes" ON comment_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM comments 
      WHERE comments.id = comment_likes.comment_id 
      AND comments.is_deleted = false
      AND EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.post_id 
        AND posts.is_deleted = false
        AND EXISTS (
          SELECT 1 FROM boards 
          WHERE boards.id = posts.board_id 
          AND boards.is_active = true
        )
      )
    )
  );

-- 댓글 좋아요 추가 정책 (대댓글 포함)
CREATE POLICY "Authenticated users can like comments" ON comment_likes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM comments 
      WHERE comments.id = comment_likes.comment_id 
      AND comments.is_deleted = false
      AND EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.post_id 
        AND posts.is_deleted = false
        AND EXISTS (
          SELECT 1 FROM boards 
          WHERE boards.id = posts.board_id 
          AND boards.is_active = true
        )
      )
    )
  );

-- 댓글 좋아요 삭제 정책 (대댓글 포함)
CREATE POLICY "Users can unlike their own comment likes" ON comment_likes
  FOR DELETE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM comments 
      WHERE comments.id = comment_likes.comment_id 
      AND comments.is_deleted = false
      AND EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = comments.post_id 
        AND posts.is_deleted = false
        AND EXISTS (
          SELECT 1 FROM boards 
          WHERE boards.id = posts.board_id 
          AND boards.is_active = true
        )
      )
    )
  );

-- 3. 대댓글 좋아요 수 업데이트를 위한 트리거 함수는 이미 존재함
-- update_comment_like_count() 함수가 comment_id를 기반으로 작동하므로
-- 부모 댓글과 대댓글 모두에 동일하게 적용됨

-- 4. 인덱스 최적화 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_user ON comment_likes(comment_id, user_id);

-- 5. 기존 댓글 좋아요 데이터 정합성 확인 및 복구
UPDATE comments 
SET like_count = (
  SELECT COUNT(*) 
  FROM comment_likes 
  WHERE comment_likes.comment_id = comments.id
)
WHERE comments.is_deleted = false;

SELECT 'Reply comments likes feature updated successfully!' as result;