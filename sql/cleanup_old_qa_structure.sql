-- 기존 JSONB 구조 정리 및 최종 마이그레이션
-- interview_questions 테이블로 완전히 이전한 후 실행하는 스크립트

-- 1. 마이그레이션 검증
-- 기존 JSONB 데이터와 새 테이블 데이터 비교
WITH jsonb_count AS (
    SELECT 
        id,
        CASE 
            WHEN questions_and_answers IS NULL OR questions_and_answers::text = 'null' THEN 0
            ELSE jsonb_array_length(questions_and_answers::jsonb)
        END as jsonb_qa_count
    FROM interviews
),
new_table_count AS (
    SELECT 
        interview_id,
        COUNT(*) as new_qa_count
    FROM interview_questions
    GROUP BY interview_id
)
SELECT 
    'Migration Validation:' as info,
    COUNT(*) as total_interviews,
    SUM(CASE WHEN COALESCE(jc.jsonb_qa_count, 0) = COALESCE(ntc.new_qa_count, 0) THEN 1 ELSE 0 END) as matching_counts,
    SUM(CASE WHEN COALESCE(jc.jsonb_qa_count, 0) != COALESCE(ntc.new_qa_count, 0) THEN 1 ELSE 0 END) as mismatched_counts
FROM interviews i
LEFT JOIN jsonb_count jc ON i.id = jc.id
LEFT JOIN new_table_count ntc ON i.id = ntc.interview_id;

-- 2. 불일치 데이터 상세 확인
WITH jsonb_count AS (
    SELECT 
        id,
        company_name,
        "position",
        CASE 
            WHEN questions_and_answers IS NULL OR questions_and_answers::text = 'null' THEN 0
            ELSE jsonb_array_length(questions_and_answers::jsonb)
        END as jsonb_qa_count
    FROM interviews
),
new_table_count AS (
    SELECT 
        interview_id,
        COUNT(*) as new_qa_count
    FROM interview_questions
    GROUP BY interview_id
)
SELECT 
    'Mismatched Records:' as info,
    i.id,
    i.company_name,
    i."position",
    COALESCE(jc.jsonb_qa_count, 0) as original_count,
    COALESCE(ntc.new_qa_count, 0) as migrated_count
FROM interviews i
LEFT JOIN jsonb_count jc ON i.id = jc.id
LEFT JOIN new_table_count ntc ON i.id = ntc.interview_id
WHERE COALESCE(jc.jsonb_qa_count, 0) != COALESCE(ntc.new_qa_count, 0)
ORDER BY i.created_at DESC
LIMIT 10;

-- 3. 백업 테이블 생성 (안전을 위해)
CREATE TABLE IF NOT EXISTS interviews_qa_backup AS 
SELECT 
    id,
    questions_and_answers,
    created_at
FROM interviews 
WHERE questions_and_answers IS NOT NULL 
AND questions_and_answers IS NOT NULL 
AND questions_and_answers::text != 'null';

-- 4. questions_and_answers 컬럼 제거 (선택사항)
-- 주의: 이 단계는 마이그레이션이 완전히 검증된 후에만 실행하세요!
-- ALTER TABLE interviews DROP COLUMN IF EXISTS questions_and_answers;

-- 5. 새로운 조회 함수 생성
CREATE OR REPLACE FUNCTION get_interview_with_questions(interview_uuid UUID)
RETURNS TABLE(
    interview_id UUID,
    company_name TEXT,
    "position" TEXT,
    interview_date DATE,
    interview_type TEXT,
    difficulty_level TEXT,
    result TEXT,
    overall_rating INTEGER,
    feedback_and_tips TEXT,
    ai_feedback JSONB,
    created_at TIMESTAMPTZ,
    questions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.company_name,
        i."position",
        i.interview_date,
        i.interview_type,
        i.difficulty_level,
        i.result,
        i.overall_rating,
        i.feedback_and_tips,
        i.ai_feedback,
        i.created_at,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'question', iq.question,
                    'answer', iq.answer,
                    'order', iq.question_order
                ) ORDER BY iq.question_order
            ) FILTER (WHERE iq.id IS NOT NULL),
            '[]'::jsonb
        ) as questions
    FROM interviews i
    LEFT JOIN interview_questions iq ON i.id = iq.interview_id
    WHERE i.id = interview_uuid
    GROUP BY i.id, i.company_name, i."position", i.interview_date, 
             i.interview_type, i.difficulty_level, i.result, 
             i.overall_rating, i.feedback_and_tips, i.ai_feedback, i.created_at;
END;
$$ LANGUAGE plpgsql;

-- 6. 커뮤니티 목록 조회 함수 생성
CREATE OR REPLACE FUNCTION get_public_interviews_with_first_question()
RETURNS TABLE(
    interview_id UUID,
    company_name TEXT,
    "position" TEXT,
    interview_date DATE,
    interview_type TEXT,
    difficulty_level TEXT,
    result TEXT,
    overall_rating INTEGER,
    created_at TIMESTAMPTZ,
    user_id UUID,
    first_question TEXT,
    total_questions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.company_name,
        i."position",
        i.interview_date,
        i.interview_type,
        i.difficulty_level,
        i.result,
        i.overall_rating,
        i.created_at,
        i.user_id,
        first_q.question as first_question,
        COALESCE(q_count.total_questions, 0)::INTEGER as total_questions
    FROM interviews i
    LEFT JOIN (
        SELECT DISTINCT ON (interview_id) 
            interview_id, 
            question
        FROM interview_questions 
        ORDER BY interview_id, question_order ASC
    ) first_q ON i.id = first_q.interview_id
    LEFT JOIN (
        SELECT 
            interview_id, 
            COUNT(*) as total_questions
        FROM interview_questions 
        GROUP BY interview_id
    ) q_count ON i.id = q_count.interview_id
    -- WHERE i.is_public = true  -- is_public 컬럼이 아직 추가되지 않음
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. 성능 테스트 쿼리
EXPLAIN ANALYZE
SELECT * FROM get_interview_with_questions(
    (SELECT id FROM interviews LIMIT 1)
);

-- 8. 사용 예시
-- 개별 면접 조회 (기존 JSONB 방식과 동일한 결과)
-- SELECT * FROM get_interview_with_questions((SELECT id FROM interviews LIMIT 1));

-- 공개 면접 목록 조회 (첫 번째 질문 포함)
-- SELECT * FROM get_public_interviews_with_first_question() LIMIT 10;

-- 직접 JOIN 쿼리 (더 유연한 조회)
/*
SELECT 
    i.*,
    array_agg(
        json_build_object(
            'question', iq.question,
            'answer', iq.answer
        ) ORDER BY iq.question_order
    ) as questions_and_answers
FROM interviews i
LEFT JOIN interview_questions iq ON i.id = iq.interview_id
WHERE i.id = (SELECT id FROM interviews LIMIT 1)
GROUP BY i.id;
*/

COMMENT ON FUNCTION get_interview_with_questions IS '개별 면접 정보와 질문들을 조회하는 함수';
COMMENT ON FUNCTION get_public_interviews_with_first_question IS '공개된 면접 목록과 첫 번째 질문을 조회하는 함수';