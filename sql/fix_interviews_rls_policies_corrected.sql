-- interviews 테이블과 interview_questions 테이블의 RLS 정책 수정
-- is_public 컬럼이 존재하지 않으므로 is_shared 컬럼만 사용

-- 기존 정책들 확인 및 삭제
DO $$ 
BEGIN
    -- interviews 테이블의 기존 정책들 삭제
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interviews' AND policyname = 'Users can view own interviews') THEN
        DROP POLICY "Users can view own interviews" ON interviews;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interviews' AND policyname = 'Users can insert own interviews') THEN
        DROP POLICY "Users can insert own interviews" ON interviews;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interviews' AND policyname = 'Users can update own interviews') THEN
        DROP POLICY "Users can update own interviews" ON interviews;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interviews' AND policyname = 'Users can delete own interviews') THEN
        DROP POLICY "Users can delete own interviews" ON interviews;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'interviews' AND policyname = 'Public can view shared interviews') THEN
        DROP POLICY "Public can view shared interviews" ON interviews;
    END IF;
    
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
END $$;

-- interviews 테이블에 RLS 활성화
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- interviews 테이블 정책 생성
CREATE POLICY "Users can view own interviews" ON interviews
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interviews" ON interviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews" ON interviews
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interviews" ON interviews
FOR DELETE USING (auth.uid() = user_id);

-- 공유된 면접만 공개적으로 볼 수 있도록 허용 (is_shared 컬럼만 사용)
CREATE POLICY "Public can view shared interviews" ON interviews
FOR SELECT USING (is_shared = true);

-- interview_questions 테이블에 RLS 활성화
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

-- interview_questions 테이블 정책 생성
CREATE POLICY "Users can view own interview questions" ON interview_questions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own interview questions" ON interview_questions
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own interview questions" ON interview_questions
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own interview questions" ON interview_questions
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.user_id = auth.uid()
    )
);

-- 공유된 면접의 질문들을 공개적으로 볼 수 있도록 허용 (is_shared 컬럼만 사용)
CREATE POLICY "Public can view questions from shared interviews" ON interview_questions
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM interviews 
        WHERE interviews.id = interview_questions.interview_id 
        AND interviews.is_shared = true
    )
);

-- 정책 적용 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('interviews', 'interview_questions')
ORDER BY tablename, policyname;

-- 완료 메시지
SELECT 'RLS 정책이 성공적으로 적용되었습니다. (is_shared 컬럼만 사용)' as status;