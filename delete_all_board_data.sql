-- 모든 게시판 데이터 삭제
-- 댓글 먼저 삭제 (외래키 제약 때문에)
DELETE FROM comments;

-- 게시글 삭제
DELETE FROM posts;

-- 게시판 삭제
DELETE FROM boards;

-- 시퀀스 초기화 (필요한 경우)
-- ALTER SEQUENCE boards_id_seq RESTART WITH 1;
-- ALTER SEQUENCE posts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE comments_id_seq RESTART WITH 1;