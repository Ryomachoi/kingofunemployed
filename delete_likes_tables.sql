-- 추천 테이블 삭제
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;

-- 게시글과 댓글의 like_count 컬럼을 0으로 초기화
UPDATE posts SET like_count = 0;
UPDATE comments SET like_count = 0;