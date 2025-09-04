-- interview_questions 테이블의 RLS 정책 수정
-- 공유된 면접의 질문들을 공개적으로 볼 수 있도록 허용

-- 기존 정책들 삭제
DO $$ 
BEGIN
    -- interview_questions 테이블의 기존 정책들 삭제
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interview_questions' AND policyname = 'Users can view own interview questions') THEN
        DROP POLICY "Users can view own interview questions" ON interview_questions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interview_questions' AND policyname = 'Users can insert own interview questions') THEN
        DROP POLICY "Users can insert own interview questions" ON interview_questions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interview_questions' AND policyname = 'Users can update own interview questions') THEN
        DROP POLICY "Users can update own interview questions" ON interview_questions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interview_questions' AND policyname = 'Users can delete own interview questions') THEN
        DROP POLICY "Users can delete own interview questions" ON interview_questions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interview_questions' AND policyname = 'Public can view questions from shared interviews') THEN
        DROP POLICY "Public can view questions from shared interviews" ON interview_questions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interview_questions' AND policyname = 'Users can view interview questions') THEN
        DROP POLICY "Users can view interview questions" ON interview_questions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interview_questions' AND policyname = 'Users can create their own interview questions') THEN
        DROP POLICY "Users can create their own interview questions" ON interview_questions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interview_questions' AND policyname = 'Users can update their own interview questions') THEN
        DROP POLICY "Users can update their own interview questions" ON interview_questions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interview_questions' AND policyname = 'Users can delete their own interview questions') THEN
        DROP POLICY "Users can delete their own interview questions" ON interview_questions;
    END IF;
END $$;

-- interview_questions 테이블에 RLS 활성화
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

-- 새로운 정책들 생성
-- 1. 사용자가 자신의 면접 질문을 볼 수 있음
CREATE POLICY "Users can view own interview questions" ON interview_questions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.user_id = auth.uid()
    )
);

-- 2. 공유된 면접의 질문들을 모든 사용자가 볼 수 있음 (가장 중요한 정책)
CREATE POLICY "Public can view questions from shared interviews" ON interview_questions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.is_shared = true
    )
);

-- 3. 사용자가 자신의 면접 질문을 생성할 수 있음
CREATE POLICY "Users can insert own interview questions" ON interview_questions
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.user_id = auth.uid()
    )
);

-- 4. 사용자가 자신의 면접 질문을 수정할 수 있음
CREATE POLICY "Users can update own interview questions" ON interview_questions
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.user_id = auth.uid()
    )
);

-- 5. 사용자가 자신의 면접 질문을 삭제할 수 있음
CREATE POLICY "Users can delete own interview questions" ON interview_questions
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.user_id = auth.uid()
    )
);

-- 정책 적용 확인
SELECT 
    'interview_questions 테이블 RLS 정책:' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'interview_questions'
ORDER BY policyname;

-- 테스트: 공유된 면접의 질문 조회
SELECT 
    'Test: 공유된 면접의 질문 조회' as test_name,
    i.company_name,
    i.position,
    i.is_shared,
    COUNT(iq.id) as question_count
FROM interviews i
LEFT JOIN interview_questions iq ON i.id = iq.interview_id
WHERE i.is_shared = true
GROUP BY i.id, i.company_name, i.position, i.is_shared
LIMIT 5;

SELECT 'interview_questions RLS 정책이 성공적으로 수정되었습니다.' as status;