-- posts 테이블에 tags 필드 추가
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- posts 테이블에 tags 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

SELECT 'Posts tags field added successfully!' as result;