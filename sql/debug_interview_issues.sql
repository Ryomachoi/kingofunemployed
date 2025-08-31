-- 면접 분석 후 저장 문제 디버깅 쿼리
-- 면접 ID가 없다는 오류와 마이페이지 조회 문제 해결을 위한 진단

-- 1. 최근 생성된 면접 데이터 확인
SELECT 
    'Recent Interviews' as info,
    id,
    company_name,
    "position",
    user_id,
    created_at,
    ai_analysis_status,
    is_shared
FROM interviews 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. 면접 질문 테이블과의 연결 상태 확인
SELECT 
    'Interview Questions Relationship' as info,
    i.id as interview_id,
    i.company_name,
    i."position",
    COUNT(iq.id) as question_count,
    i.created_at
FROM interviews i
LEFT JOIN interview_questions iq ON i.id = iq.interview_id
WHERE i.created_at >= NOW() - INTERVAL '7 days'
GROUP BY i.id, i.company_name, i."position", i.created_at
ORDER BY i.created_at DESC
LIMIT 10;

-- 3. AI 분석 상태별 면접 개수 확인
SELECT 
    'AI Analysis Status Distribution' as info,
    ai_analysis_status,
    COUNT(*) as count
FROM interviews
GROUP BY ai_analysis_status;

-- 4. 공유 상태별 면접 개수 확인
SELECT 
    'Share Status Distribution' as info,
    CASE 
        WHEN is_shared IS NULL THEN 'NULL'
        WHEN is_shared = true THEN 'SHARED'
        WHEN is_shared = false THEN 'NOT_SHARED'
    END as share_status,
    COUNT(*) as count
FROM interviews
GROUP BY is_shared;

-- 5. 사용자별 면접 개수 확인 (최근 활동)
SELECT 
    'User Interview Count (Recent)' as info,
    user_id,
    COUNT(*) as interview_count,
    MAX(created_at) as last_interview
FROM interviews
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY interview_count DESC
LIMIT 10;

-- 6. 빈 또는 NULL 데이터 확인
SELECT 
    'Data Quality Check' as info,
    COUNT(*) as total_interviews,
    COUNT(CASE WHEN company_name IS NULL OR company_name = '' THEN 1 END) as empty_company,
    COUNT(CASE WHEN "position" IS NULL OR "position" = '' THEN 1 END) as empty_position,
    COUNT(CASE WHEN ai_feedback IS NULL THEN 1 END) as no_ai_feedback,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as no_user_id
FROM interviews;

-- 7. 최근 면접의 상세 정보 (디버깅용)
SELECT 
    'Recent Interview Details' as info,
    id,
    company_name,
    "position",
    user_id,
    interview_date,
    interview_type,
    difficulty_level,
    result,
    overall_rating,
    ai_analysis_status,
    is_shared,
    created_at,
    updated_at,
    CASE 
        WHEN ai_feedback IS NULL THEN 'NULL'
        WHEN ai_feedback::text = 'null' THEN 'JSON_NULL'
        ELSE 'HAS_DATA'
    END as ai_feedback_status
FROM interviews 
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 8. 면접 질문 데이터 상태 확인
SELECT 
    'Interview Questions Status' as info,
    COUNT(*) as total_questions,
    COUNT(DISTINCT interview_id) as interviews_with_questions,
    AVG(question_order) as avg_question_order,
    COUNT(CASE WHEN question IS NULL OR question = '' THEN 1 END) as empty_questions,
    COUNT(CASE WHEN answer IS NULL OR answer = '' THEN 1 END) as empty_answers
FROM interview_questions;

-- 9. 최근 생성된 면접 질문들
SELECT 
    'Recent Interview Questions' as info,
    iq.interview_id,
    i.company_name,
    i."position",
    iq.question_order,
    LEFT(iq.question, 50) as question_preview,
    LEFT(iq.answer, 50) as answer_preview,
    iq.created_at
FROM interview_questions iq
JOIN interviews i ON iq.interview_id = i.id
WHERE iq.created_at >= NOW() - INTERVAL '1 day'
ORDER BY iq.created_at DESC, iq.question_order ASC
LIMIT 20;