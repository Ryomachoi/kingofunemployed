-- interviews 테이블과 user_profiles 테이블 간의 외래 키 관계 수정

-- 1. 먼저 interviews 테이블이 존재하는지 확인
DO $$
BEGIN
    -- interviews 테이블이 존재하지 않으면 생성
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'interviews') THEN
        CREATE TABLE interviews (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            company_name VARCHAR(200) NOT NULL,
            position VARCHAR(200) NOT NULL,
            interview_date DATE,
            interview_type VARCHAR(100),
            difficulty_level VARCHAR(50),
            questions_and_answers JSONB,
            result VARCHAR(100),
            overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
            feedback_and_tips TEXT,
            ai_feedback TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- RLS 정책 활성화
        ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
        
        -- 정책 생성
        CREATE POLICY "Users can view all interviews" ON interviews
            FOR SELECT USING (true);
            
        CREATE POLICY "Authenticated users can create interviews" ON interviews
            FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
            
        CREATE POLICY "Users can update their own interviews" ON interviews
            FOR UPDATE USING (auth.uid() = user_id);
            
        CREATE POLICY "Users can delete their own interviews" ON interviews
            FOR DELETE USING (auth.uid() = user_id);
            
        -- 인덱스 생성
        CREATE INDEX idx_interviews_user_id ON interviews(user_id);
        CREATE INDEX idx_interviews_company_name ON interviews(company_name);
        CREATE INDEX idx_interviews_created_at ON interviews(created_at DESC);
        
        RAISE NOTICE 'interviews 테이블이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'interviews 테이블이 이미 존재합니다.';
    END IF;
END
$$;

-- 2. user_profiles 테이블이 존재하는지 확인하고 필요시 생성
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        CREATE TABLE user_profiles (
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            nickname VARCHAR(50),
            display_name VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- RLS 정책 활성화
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- 정책 생성
        CREATE POLICY "Users can view all profiles" ON user_profiles
            FOR SELECT USING (true);
            
        CREATE POLICY "Users can update their own profile" ON user_profiles
            FOR ALL USING (auth.uid() = user_id);
            
        RAISE NOTICE 'user_profiles 테이블이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'user_profiles 테이블이 이미 존재합니다.';
    END IF;
END
$$;

-- 3. 테이블 구조 확인
SELECT 'interviews 테이블 구조:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'interviews'
ORDER BY ordinal_position;

SELECT 'user_profiles 테이블 구조:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

SELECT '외래 키 관계 확인 완료!' as result;