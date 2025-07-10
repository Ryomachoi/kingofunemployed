-- 모든 게시물과 댓글 삭제

-- 댓글 먼저 삭제 (외래키 제약 때문에)
DELETE FROM comments;

-- 게시물 삭제
DELETE FROM posts;

-- 시퀀스 리셋 (필요한 경우)
-- ALTER SEQUENCE posts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE comments_id_seq RESTART WITH 1;

SELECT 'All posts and comments have been deleted successfully.' as result;