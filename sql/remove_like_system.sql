-- 추천 시스템 완전 제거 SQL 스크립트 (스키마 안전 버전)
-- Supabase 대시보드의 SQL Editor에서 실행하세요
-- 주의: 이 스크립트는 모든 추천 관련 데이터를 영구적으로 삭제합니다

-- 현재 스키마 확인 및 설정
SET search_path TO public;

-- 1단계: 추천 관련 트리거 삭제 (스키마 명시)
DO $$
BEGIN
    -- post_likes 테이블이 존재하는 경우에만 트리거 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'post_likes') THEN
        DROP TRIGGER IF EXISTS update_post_like_count_trigger ON public.post_likes;
        RAISE NOTICE 'post_likes 트리거가 삭제되었습니다.';
    ELSE
        RAISE NOTICE 'post_likes 테이블이 존재하지 않습니다.';
    END IF;
    
    -- comment_likes 테이블이 존재하는 경우에만 트리거 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'comment_likes') THEN
        DROP TRIGGER IF EXISTS update_comment_like_count_trigger ON public.comment_likes;
        RAISE NOTICE 'comment_likes 트리거가 삭제되었습니다.';
    ELSE
        RAISE NOTICE 'comment_likes 테이블이 존재하지 않습니다.';
    END IF;
END $$;

-- 2단계: 추천 관련 함수 삭제
DROP FUNCTION IF EXISTS public.update_post_like_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_comment_like_count() CASCADE;

-- 3단계: 추천 테이블 삭제 (스키마 명시)
DROP TABLE IF EXISTS public.comment_likes CASCADE;
DROP TABLE IF EXISTS public.post_likes CASCADE;

-- 4단계: posts 테이블에서 like_count 컬럼 삭제 (안전하게)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'like_count') THEN
        ALTER TABLE public.posts DROP COLUMN like_count;
        RAISE NOTICE 'posts 테이블에서 like_count 컬럼이 삭제되었습니다.';
    ELSE
        RAISE NOTICE 'posts 테이블에 like_count 컬럼이 존재하지 않습니다.';
    END IF;
END $$;

-- 5단계: comments 테이블에서 like_count 컬럼 삭제 (안전하게)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'like_count') THEN
        ALTER TABLE public.comments DROP COLUMN like_count;
        RAISE NOTICE 'comments 테이블에서 like_count 컬럼이 삭제되었습니다.';
    ELSE
        RAISE NOTICE 'comments 테이블에 like_count 컬럼이 존재하지 않습니다.';
    END IF;
END $$;

-- 6단계: 추천 관련 인덱스 삭제 (스키마 명시)
DROP INDEX IF EXISTS public.idx_post_likes_post_id;
DROP INDEX IF EXISTS public.idx_post_likes_user_id;
DROP INDEX IF EXISTS public.idx_comment_likes_comment_id;
DROP INDEX IF EXISTS public.idx_comment_likes_user_id;

-- 7단계: RLS 정책 삭제 (안전하게)
DO $$
BEGIN
    -- post_likes 테이블이 존재하는 경우에만 정책 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'post_likes') THEN
        DROP POLICY IF EXISTS "Users can view all post likes" ON public.post_likes;
        DROP POLICY IF EXISTS "Users can insert their own post likes" ON public.post_likes;
        DROP POLICY IF EXISTS "Users can delete their own post likes" ON public.post_likes;
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.post_likes;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.post_likes;
        DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.post_likes;
        RAISE NOTICE 'post_likes RLS 정책들이 삭제되었습니다.';
    END IF;
    
    -- comment_likes 테이블이 존재하는 경우에만 정책 삭제
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'comment_likes') THEN
        DROP POLICY IF EXISTS "Users can view all comment likes" ON public.comment_likes;
        DROP POLICY IF EXISTS "Users can insert their own comment likes" ON public.comment_likes;
        DROP POLICY IF EXISTS "Users can delete their own comment likes" ON public.comment_likes;
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.comment_likes;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.comment_likes;
        DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.comment_likes;
        RAISE NOTICE 'comment_likes RLS 정책들이 삭제되었습니다.';
    END IF;
END $$;

-- 완료 메시지
SELECT '추천 시스템이 성공적으로 제거되었습니다!' as result;

-- 확인용 쿼리 (선택사항)
-- 다음 쿼리들을 실행하여 제거가 완료되었는지 확인할 수 있습니다:

/*
-- 테이블 존재 여부 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('post_likes', 'comment_likes');

-- 함수 존재 여부 확인
SELECT routine_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%like_count%';

-- 트리거 존재 여부 확인
SELECT trigger_name
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%like_count%';

-- posts 테이블 구조 확인 (like_count 컬럼이 없어야 함)
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts'
ORDER BY ordinal_position;

-- comments 테이블 구조 확인 (like_count 컬럼이 없어야 함)
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'comments'
ORDER BY ordinal_position;
*/