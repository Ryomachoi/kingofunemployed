-- QnA 게시판 관련 데이터베이스 테이블 삭제
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- posts 테이블 삭제 (QnA 게시글 데이터)
DROP TABLE IF EXISTS posts CASCADE;

-- 관련된 인덱스나 제약조건도 함께 삭제됩니다
-- CASCADE 옵션으로 의존성이 있는 객체들도 함께 삭제

-- 실행 후 확인
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';