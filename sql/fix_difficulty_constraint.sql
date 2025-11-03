-- 기존 데이터와 호환되는 difficulty_level 제약 조건 수정
-- Supabase SQL Editor에서 순서대로 실행하세요

-- 1. 현재 difficulty_level 값들 확인
SELECT DISTINCT difficulty_level, COUNT(*) as count
FROM interviews 
WHERE difficulty_level IS NOT NULL
GROUP BY difficulty_level;

-- 2. 기존 제약 조건 제거
ALTER TABLE interviews DROP CONSTRAINT IF EXISTS interviews_difficulty_level_check;

-- 3. 기존 한국어 데이터를 영어로 업데이트 (만약 있다면)
UPDATE interviews 
SET difficulty_level = CASE 
    WHEN difficulty_level = '쉬움' THEN 'easy'
    WHEN difficulty_level = '보통' THEN 'medium'
    WHEN difficulty_level = '어려움' THEN 'hard'
    ELSE difficulty_level
END
WHERE difficulty_level IN ('쉬움', '보통', '어려움');

-- 4. 새로운 제약 조건 추가 (기존 데이터와 호환)
ALTER TABLE interviews ADD CONSTRAINT interviews_difficulty_level_check 
CHECK (difficulty_level IN ('easy', 'medium', 'hard', '1', '2', '3', '4', '5'));

-- 5. 업데이트 결과 확인
SELECT DISTINCT difficulty_level, COUNT(*) as count
FROM interviews 
WHERE difficulty_level IS NOT NULL
GROUP BY difficulty_level;

-- 6. 제약 조건 확인
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c 
JOIN pg_namespace n ON n.oid = c.connamespace 
WHERE contype = 'c' 
AND conrelid = 'interviews'::regclass
AND conname = 'interviews_difficulty_level_check';