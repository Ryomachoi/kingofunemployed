-- 세션 기반 익명 게시물/댓글 권한 관리를 위한 테이블 수정

-- posts 테이블에 session_id 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS session_id TEXT;

-- comments 테이블에 session_id 컬럼 추가  
ALTER TABLE comments ADD COLUMN IF NOT EXISTS session_id TEXT;

-- 기존 RLS 정책 삭제 (익명 게시물/댓글을 위해)
DROP POLICY IF EXISTS "Post authors can update their posts" ON posts;
DROP POLICY IF EXISTS "Post authors can delete their posts" ON posts;
DROP POLICY IF EXISTS "Comment authors can update their comments" ON comments;
DROP POLICY IF EXISTS "Comment authors can delete their comments" ON comments;

-- 새로운 RLS 정책 생성 (더 유연한 권한 관리)
CREATE POLICY "Authenticated users can update posts" ON posts 
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete posts" ON posts 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update comments" ON comments 
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete comments" ON comments 
  FOR DELETE 
  USING (auth.role() = 'authenticated');