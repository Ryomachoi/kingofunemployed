-- 면접 질문과 답변을 별도 테이블로 분리하는 새로운 스키마 (수정된 버전)
-- 이 방식으로 질문 개수 제한 없이 깔끔하게 데이터를 관리할 수 있습니다.

-- 1. interview_questions 테이블 생성
CREATE TABLE IF NOT EXISTS interview_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
    question_order INTEGER NOT NULL, -- 질문 순서 (1, 2, 3, ...)
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 복합 유니크 제약: 같은 면접에서 같은 순서의 질문은 하나만
    UNIQUE(interview_id, question_order)
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_order ON interview_questions(interview_id, question_order);

-- 3. RLS 정책 설정
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 질문을 볼 수 있음 (면접이 공개된 경우)
DROP POLICY IF EXISTS "Users can view interview questions" ON interview_questions;
CREATE POLICY "Users can view interview questions" ON interview_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_questions.interview_id
        )
    );

-- 인증된 사용자가 자신의 면접 질문을 생성할 수 있음
DROP POLICY IF EXISTS "Users can create their own interview questions" ON interview_questions;
CREATE POLICY "Users can create their own interview questions" ON interview_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_questions.interview_id 
            AND interviews.user_id = auth.uid()
        )
    );

-- 사용자가 자신의 면접 질문을 수정할 수 있음
DROP POLICY IF EXISTS "Users can update their own interview questions" ON interview_questions;
CREATE POLICY "Users can update their own interview questions" ON interview_questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_questions.interview_id 
            AND interviews.user_id = auth.uid()
        )
    );

-- 사용자가 자신의 면접 질문을 삭제할 수 있음
DROP POLICY IF EXISTS "Users can delete their own interview questions" ON interview_questions;
CREate POLICY "Users can delete their own interview questions" ON interview_questions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM interviews 
            WHERE interviews.id = interview_questions.interview_id 
            AND interviews.user_id = auth.uid()
        )
    );

-- 4. 기존 데이터 마이그레이션을 위한 함수 생성 (수정된 버전)
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
        AND questions_and_answers != 'null'
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
                CONTINUE;
        END;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- 5. 마이그레이션 실행
SELECT migrate_questions_and_answers() as migrated_interviews_count;

-- 6. 마이그레이션 결과 확인
SELECT 
    'Migration Results:' as info,
    COUNT(DISTINCT interview_id) as interviews_with_questions,
    COUNT(*) as total_questions
FROM interview_questions;

-- 7. 샘플 데이터 확인
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

-- 8. 새로운 스키마의 장점:
-- ✅ 질문 개수에 제한이 없음
-- ✅ 각 질문과 답변을 개별적으로 쿼리 가능
-- ✅ 질문 순서 보장
-- ✅ 인덱스를 통한 빠른 조회
-- ✅ 정규화된 데이터 구조
-- ✅ 향후 질문별 메타데이터 추가 용이 (난이도, 카테고리 등)

COMMENT ON TABLE interview_questions IS '면접 질문과 답변을 저장하는 테이블 - JSONB에서 정규화된 구조로 개선';
COMMENT ON COLUMN interview_questions.question_order IS '질문 순서 (1부터 시작)';
COMMENT ON COLUMN interview_questions.question IS '면접 질문 내용';
COMMENT ON COLUMN interview_questions.answer IS '면접 답변 내용';