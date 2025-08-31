-- 면접 분석 기능을 위한 모든 데이터베이스 제약조건 수정
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행해야 합니다.
-- 순서대로 실행하세요!

-- ========================================
-- 1. questions_and_answers 컬럼 NOT NULL 제약조건 제거
-- ========================================

-- 현재 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'interviews'
ORDER BY ordinal_position;

-- questions_and_answers 컬럼의 NOT NULL 제약조건 제거
ALTER TABLE interviews 
ALTER COLUMN questions_and_answers DROP NOT NULL;

-- 변경 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'interviews'
    AND column_name = 'questions_and_answers';

-- ========================================
-- 2. interview_type 제약조건 수정
-- ========================================

-- 현재 interview_type 값들 확인
SELECT DISTINCT interview_type, COUNT(*) as count
FROM interviews 
WHERE interview_type IS NOT NULL
GROUP BY interview_type;

-- 기존 제약 조건 제거
ALTER TABLE interviews DROP CONSTRAINT IF EXISTS interviews_interview_type_check;

-- 기존 한국어 데이터를 영어로 업데이트
UPDATE interviews 
SET interview_type = CASE 
    WHEN interview_type = '화상면접' THEN 'video'
    WHEN interview_type = '대면면접' THEN 'in_person'
    WHEN interview_type = '전화면접' THEN 'phone'
    WHEN interview_type = '기타' THEN 'other'
    ELSE interview_type
END
WHERE interview_type IN ('화상면접', '대면면접', '전화면접', '기타');

-- 새로운 제약 조건 추가 (기존 데이터와 호환)
ALTER TABLE interviews ADD CONSTRAINT interviews_interview_type_check 
CHECK (interview_type IN ('video', 'in_person', 'phone', 'other', 'technical', 'behavioral', 'coding', 'presentation'));

-- 업데이트 결과 확인
SELECT DISTINCT interview_type, COUNT(*) as count
FROM interviews 
WHERE interview_type IS NOT NULL
GROUP BY interview_type;

-- ========================================
-- 3. 제약 조건 확인
-- ========================================

-- 모든 제약 조건 확인
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c 
JOIN pg_namespace n ON n.oid = c.connamespace 
WHERE contype = 'c' 
AND conrelid = 'interviews'::regclass;

-- ========================================
-- 4. 테스트 데이터 삽입 (선택사항)
-- ========================================

-- 테스트 데이터로 제약조건이 제대로 수정되었는지 확인
-- INSERT INTO interviews (
--     user_id,
--     company_name,
--     position,
--     interview_date,
--     interview_type,
--     difficulty_level,
--     result,
--     overall_rating,
--     ai_feedback,
--     analysis_timestamp,
--     ai_analysis_status,
--     created_at,
--     updated_at
-- ) VALUES (
--     '550e8400-e29b-41d4-a716-446655440000',
--     '테스트 회사',
--     '테스트 직무',
--     CURRENT_DATE,
--     'other',
--     'medium',
--     'pending',
--     3,
--     '{"test": "data"}',
--     NOW(),
--     'completed',
--     NOW(),
--     NOW()
-- );

-- ========================================
-- 완료 메시지
-- ========================================

SELECT '✅ 모든 제약조건 수정이 완료되었습니다!' as status;
SELECT '이제 면접 분석 기능이 정상적으로 작동할 것입니다.' as message;