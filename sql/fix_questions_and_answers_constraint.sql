-- interviews 테이블의 questions_and_answers 컬럼 제약조건 수정
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행해야 합니다.

-- 1. 현재 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'interviews'
ORDER BY ordinal_position;

-- 2. questions_and_answers 컬럼의 NOT NULL 제약조건 제거
ALTER TABLE interviews 
ALTER COLUMN questions_and_answers DROP NOT NULL;

-- 3. 변경 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'interviews'
    AND column_name = 'questions_and_answers';

-- 4. 테스트 데이터 삽입 (선택사항)
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
--     'technical',
--     'medium',
--     'pending',
--     3,
--     '{"test": "data"}',
--     NOW(),
--     'completed',
--     NOW(),
--     NOW()
-- );