-- 대댓글 기능을 위한 데이터베이스 스키마 수정
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- comments 테이블에 parent_comment_id 컬럼 추가
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- parent_comment_id 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);

-- 대댓글 깊이 제한을 위한 체크 제약 조건 추가
-- 대댓글의 대댓글은 허용하지 않음 (최대 2단계까지만)
CREATE OR REPLACE FUNCTION check_reply_depth()
RETURNS TRIGGER AS $$
BEGIN
  -- parent_comment_id가 있는 경우 (대댓글인 경우)
  IF NEW.parent_comment_id IS NOT NULL THEN
    -- 부모 댓글이 이미 대댓글인지 확인
    IF EXISTS (
      SELECT 1 FROM comments 
      WHERE id = NEW.parent_comment_id 
      AND parent_comment_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION '대댓글의 대댓글은 작성할 수 없습니다.';
    END IF;
    
    -- 부모 댓글이 존재하고 삭제되지 않았는지 확인
    IF NOT EXISTS (
      SELECT 1 FROM comments 
      WHERE id = NEW.parent_comment_id 
      AND is_deleted = false
    ) THEN
      RAISE EXCEPTION '존재하지 않거나 삭제된 댓글에는 대댓글을 작성할 수 없습니다.';
    END IF;
    
    -- 부모 댓글과 같은 게시글에 속하는지 확인
    IF NOT EXISTS (
      SELECT 1 FROM comments 
      WHERE id = NEW.parent_comment_id 
      AND post_id = NEW.post_id
    ) THEN
      RAISE EXCEPTION '다른 게시글의 댓글에는 대댓글을 작성할 수 없습니다.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 대댓글 깊이 체크 트리거 생성
CREATE TRIGGER check_reply_depth_trigger
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION check_reply_depth();

-- 댓글 삭제 시 대댓글 처리를 위한 함수 수정
CREATE OR REPLACE FUNCTION handle_comment_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- 댓글이 소프트 삭제될 때
  IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
    -- 해당 댓글에 대댓글이 있는지 확인
    IF EXISTS (
      SELECT 1 FROM comments 
      WHERE parent_comment_id = OLD.id 
      AND is_deleted = false
    ) THEN
      -- 대댓글이 있으면 내용만 "삭제된 댓글입니다."로 변경
      NEW.content = '삭제된 댓글입니다.';
      NEW.is_deleted = false; -- 실제로는 삭제하지 않음
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 댓글 삭제 처리 트리거 생성
CREATE TRIGGER handle_comment_deletion_trigger
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION handle_comment_deletion();

-- RLS 정책 업데이트 (대댓글 포함)
DROP POLICY IF EXISTS "Users can view comments" ON comments;
CREATE POLICY "Users can view comments" ON comments
  FOR SELECT USING (
    is_deleted = false AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.is_deleted = false
      AND EXISTS (SELECT 1 FROM boards WHERE boards.id = posts.board_id AND boards.is_active = true)
    )
  );

SELECT 'Reply comments feature added successfully!' as result;