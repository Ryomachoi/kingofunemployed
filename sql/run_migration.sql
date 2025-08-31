-- 기존 데이터를 interview_questions 테이블로 마이그레이션
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 마이그레이션 함수 재생성 (안전한 버전)
CREATE OR REPLACE FUNCTION migrate_questions_and_answers()
RETURNS INTEGER AS $$
DECLARE
    interview_record RECORD;
    qa_item RECORD;
    question_counter INTEGER;
    migrated_count INTEGER := 0;
    parsed_qa JSONB;
BEGIN
    -- 기존 interviews 테이블의 모든 레코드를 순회
    FOR interview_record IN 
        SELECT id, questions_and_answers 
        FROM interviews 
        WHERE questions_and_answers IS NOT NULL 
        AND questions_and_answers != '' 
        AND questions_and_answers::text != 'null'
    LOOP
        question_counter := 1;
        
        -- questions_and_answers가 TEXT인지 JSONB인지 확인하고 처리
        BEGIN
            -- TEXT를 JSONB로 파싱 시도
            IF interview_record.questions_and_answers::text ~ '^\\s*\\[' THEN
                parsed_qa := interview_record.questions_and_answers::text::jsonb;
            ELSE
                -- JSONB 타입이라면 직접 사용
                parsed_qa := interview_record.questions_and_answers;
            END IF;
            
            -- JSONB 배열의 길이 확인
            IF jsonb_array_length(parsed_qa) > 0 THEN
                -- JSONB 배열의 각 질문-답변 쌍을 순회
                FOR qa_item IN 
                    SELECT 
                        value->>'question' as question,
                        value->>'answer' as answer
                    FROM jsonb_array_elements(parsed_qa)
                LOOP
                    -- 질문과 답변이 모두 존재하는 경우에만 삽입
                    IF qa_item.question IS NOT NULL AND qa_item.answer IS NOT NULL 
                       AND trim(qa_item.question) != '' AND trim(qa_item.answer) != '' THEN
                        
                        INSERT INTO interview_questions (
                            interview_id, 
                            question_order, 
                            question, 
                            answer
                        ) VALUES (
                            interview_record.id,
                            question_counter,
                            trim(qa_item.question),
                            trim(qa_item.answer)
                        ) ON CONFLICT (interview_id, question_order) DO NOTHING;
                        
                        question_counter := question_counter + 1;
                    END IF;
                END LOOP;
                
                migrated_count := migrated_count + 1;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                -- JSON 파싱 실패 시 로그 출력하고 다음 레코드로 진행
                RAISE NOTICE 'Failed to parse questions_and_answers for interview_id: %, error: %', interview_record.id, SQLERRM;
        END;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- 2. 현재 상태 확인
SELECT 
    'Before Migration:' as status,
    COUNT(*) as total_interviews,
    COUNT(CASE WHEN questions_and_answers IS NOT NULL THEN 1 END) as interviews_with_qa
FROM interviews;

SELECT 
    'Current interview_questions:' as status,
    COUNT(*) as total_questions
FROM interview_questions;

-- 3. 마이그레이션 실행
SELECT migrate_questions_and_answers() as migrated_interviews_count;

-- 4. 마이그레이션 결과 확인
SELECT 
    'After Migration:' as status,
    COUNT(DISTINCT interview_id) as interviews_with_questions,
    COUNT(*) as total_questions
FROM interview_questions;

-- 5. 샘플 데이터 확인
SELECT 
    i.company_name,
    i.position,
    iq.question_order,
    LEFT(iq.question, 50) || '...' as question_preview,
    LEFT(iq.answer, 50) || '...' as answer_preview
FROM interviews i
JOIN interview_questions iq ON i.id = iq.interview_id
ORDER BY i.created_at DESC, iq.question_order
LIMIT 10;

-- 6. 함수 정리
DROP FUNCTION IF EXISTS migrate_questions_and_answers();

SELECT '마이그레이션이 완료되었습니다!' as result;