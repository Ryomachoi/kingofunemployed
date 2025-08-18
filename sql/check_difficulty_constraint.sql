-- 현재 interviews 테이블의 CHECK 제약 조건을 확인하는 쿼리
-- Supabase SQL Editor에서 실행하세요

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c 
JOIN pg_namespace n ON n.oid = c.connamespace 
WHERE contype = 'c' 
AND conrelid = 'interviews'::regclass;

-- 만약 interviews_difficulty_level_check 제약 조건이 존재한다면,
-- 다음 쿼리로 제거할 수 있습니다:
-- ALTER TABLE interviews DROP CONSTRAINT interviews_difficulty_level_check;

-- 또는 새로운 제약 조건을 추가하려면:
-- ALTER TABLE interviews ADD CONSTRAINT interviews_difficulty_level_check 
-- CHECK (difficulty_level IN ('easy', 'medium', 'hard'));