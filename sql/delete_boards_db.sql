-- 게시판 관련 모든 테이블과 데이터를 삭제하는 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 기존 테이블 삭제 (순서 중요: 외래 키 제약 조건 때문에)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS boards CASCADE;

-- 기존 함수 및 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_board_post_count();
DROP TRIGGER IF EXISTS update_board_post_count_trigger ON posts;

-- RLS 정책 삭제 (테이블이 삭제되면 자동으로 삭제되지만 명시적으로 표시)
-- DROP POLICY IF EXISTS "Users can view active boards" ON boards;
-- DROP POLICY IF EXISTS "Authenticated users can create boards" ON boards;
-- DROP POLICY IF EXISTS "Users can view posts in active boards" ON posts;
-- DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
-- DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
-- DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
-- DROP POLICY IF EXISTS "Users can view comments" ON comments;
-- DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
-- DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
-- DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

SELECT 'All board-related tables, functions, and triggers have been deleted successfully.' as result;