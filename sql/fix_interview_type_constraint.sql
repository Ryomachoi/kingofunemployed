-- 기존 데이터와 호환되는 interview_type 제약 조건 수정
-- Supabase SQL Editor에서 순서대로 실행하세요

-- 1. 현재 interview_type 값들 확인
SELECT DISTINCT interview_type, COUNT(*) as count
FROM interviews 
WHERE interview_type IS NOT NULL
GROUP BY interview_type;

-- 2. 기존 제약 조건 제거
ALTER TABLE interviews DROP CONSTRAINT IF EXISTS interviews_interview_type_check;

-- 3. 기존 한국어 데이터를 영어로 업데이트
UPDATE interviews 
SET interview_type = CASE 
    WHEN interview_type = '화상면접' THEN 'video'
    WHEN interview_type = '대면면접' THEN 'in_person'
    WHEN interview_type = '전화면접' THEN 'phone'
    WHEN interview_type = '기타' THEN 'other'
    ELSE interview_type
END
WHERE interview_type IN ('화상면접', '대면면접', '전화면접', '기타');

-- 4. 새로운 제약 조건 추가 (기존 데이터와 호환)
ALTER TABLE interviews ADD CONSTRAINT interviews_interview_type_check 
CHECK (interview_type IN ('video', 'in_person', 'phone', 'other', 'technical', 'behavioral', 'coding', 'presentation'));

-- 5. 업데이트 결과 확인
SELECT DISTINCT interview_type, COUNT(*) as count
FROM interviews 
WHERE interview_type IS NOT NULL
GROUP BY interview_type;

-- 6. 제약 조건 확인
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c 
JOIN pg_namespace n ON n.oid = c.connamespace 
WHERE contype = 'c' 
AND conrelid = 'interviews'::regclass
AND conname = 'interviews_interview_type_check';