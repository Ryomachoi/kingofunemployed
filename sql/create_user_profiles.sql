-- 사용자 프로필 테이블 생성 및 닉네임 시스템 구축
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. user_profiles 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 생성
-- 모든 사용자가 프로필을 볼 수 있음
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

-- 사용자는 자신의 프로필만 생성할 수 있음
CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 사용자는 자신의 프로필만 수정할 수 있음
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. 기존 사용자들을 위한 기본 프로필 생성
-- 현재 auth.users에 있는 모든 사용자에 대해 기본 프로필 생성
INSERT INTO user_profiles (id, nickname, display_name)
SELECT 
  id,
  NULL as nickname, -- 닉네임은 비워둠 (사용자가 직접 설정)
  SUBSTRING(id::text, 1, 8) as display_name -- UUID 앞 8자리를 기본 표시명으로
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles);

-- 5. 새로운 사용자 가입 시 자동으로 프로필 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (new.id, SUBSTRING(new.id::text, 1, 8));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 새 사용자 가입 시 트리거 설정
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. 닉네임 중복 체크를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname ON user_profiles(nickname) WHERE nickname IS NOT NULL;

-- 8. 사용자 표시명을 가져오는 함수 생성
CREATE OR REPLACE FUNCTION get_user_display_name(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT 
    COALESCE(nickname, display_name, SUBSTRING(user_id::text, 1, 8))
  INTO result
  FROM user_profiles
  WHERE id = user_id;
  
  -- 프로필이 없는 경우 UUID 앞 8자리 반환
  IF result IS NULL THEN
    result := SUBSTRING(user_id::text, 1, 8);
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

SELECT 'User profiles system created successfully!' as result;