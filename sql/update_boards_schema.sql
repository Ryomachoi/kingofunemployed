-- 게시판 테이블에 새로운 컬럼들을 추가하는 마이그레이션 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- boards 테이블에 새로운 컬럼들 추가
ALTER TABLE boards ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE boards ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);
ALTER TABLE boards ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE boards ADD COLUMN IF NOT EXISTS headquarters_location VARCHAR(200);
ALTER TABLE boards ADD COLUMN IF NOT EXISTS website VARCHAR(500);
ALTER TABLE boards ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE boards ADD COLUMN IF NOT EXISTS logo_icon VARCHAR(10);
ALTER TABLE boards ADD COLUMN IF NOT EXISTS community_rules TEXT;

-- posts 테이블에 view_count 컬럼 추가 (database.ts에 정의되어 있음)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- comments 테이블에 parent_comment_id 컬럼 추가 (대댓글 기능용)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_boards_category ON boards(category);
CREATE INDEX IF NOT EXISTS idx_boards_industry ON boards(industry);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

SELECT 'Boards schema updated successfully!' as result;