-- RLS 정책 수정: 소프트 삭제를 위한 UPDATE 정책 개선

-- 기존 게시글 UPDATE 정책 삭제
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;

-- 새로운 게시글 UPDATE 정책 생성 (WITH CHECK 제거)
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

-- 기존 댓글 UPDATE 정책 삭제
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;

-- 새로운 댓글 UPDATE 정책 생성 (WITH CHECK 제거)
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

SELECT 'RLS policies updated successfully!' as result;