-- posts 테이블에 view_count 컬럼 추가
ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0;

-- view_count 인덱스 생성 (성능 최적화)
CREATE INDEX idx_posts_view_count ON posts(view_count DESC);

-- 기존 게시글들의 view_count를 0으로 초기화 (이미 DEFAULT 0이지만 명시적으로)
UPDATE posts SET view_count = 0 WHERE view_count IS NULL;