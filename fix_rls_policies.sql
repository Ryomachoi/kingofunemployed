-- RLS 정책 수정: UPDATE 작업에 WITH CHECK 조건 추가

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Post authors can update their posts" ON posts;
DROP POLICY IF EXISTS "Comment authors can update their comments" ON comments;

-- 새로운 정책 생성 (WITH CHECK 조건 추가)
CREATE POLICY "Post authors can update their posts" ON posts 
  FOR UPDATE 
  USING (auth.uid() = author_id) 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Comment authors can update their comments" ON comments 
  FOR UPDATE 
  USING (auth.uid() = author_id) 
  WITH CHECK (auth.uid() = author_id);