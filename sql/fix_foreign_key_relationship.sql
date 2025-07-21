-- posts 테이블과 user_profiles 테이블 간의 외래키 관계 설정
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. posts 테이블의 author_id에 외래키 제약조건 추가
-- 기존 제약조건이 있다면 먼저 삭제
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- 새로운 외래키 제약조건 추가
ALTER TABLE posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- 2. comments 테이블의 author_id에도 외래키 제약조건 추가 (필요한 경우)
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;

ALTER TABLE comments 
ADD CONSTRAINT comments_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- 3. 관계 확인을 위한 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW posts_with_profiles AS
SELECT 
  p.*,
  up.nickname,
  up.display_name
FROM posts p
LEFT JOIN user_profiles up ON p.author_id = up.id;

SELECT 'Foreign key relationships created successfully!' as result;