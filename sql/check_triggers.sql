-- 데이터베이스에 트리거와 함수가 제대로 생성되었는지 확인하는 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. 트리거 함수 확인
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%like_count%'
ORDER BY routine_name;

-- 2. 트리거 확인
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%like_count%'
ORDER BY trigger_name;

-- 3. post_likes 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'post_likes'
ORDER BY ordinal_position;

-- 4. posts 테이블의 like_count 컬럼 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'posts'
AND column_name = 'like_count';

-- 5. 실제 데이터 확인 (테스트용)
SELECT 
    p.id,
    p.title,
    p.like_count,
    COUNT(pl.id) as actual_like_count
FROM posts p
LEFT JOIN post_likes pl ON p.id = pl.post_id
WHERE p.is_deleted = false
GROUP BY p.id, p.title, p.like_count
ORDER BY p.created_at DESC
LIMIT 10;