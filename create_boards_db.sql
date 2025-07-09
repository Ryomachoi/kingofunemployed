-- 기업별 게시판 시스템을 위한 데이터베이스 스키마
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 기존 테이블 삭제 (순서 중요: 외래 키 제약 조건 때문에)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 기존 함수 및 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_board_post_count();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 0. 사용자 프로필 테이블 생성 (auth.users와 연결)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 가입시 자동으로 프로필 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 가입시 트리거 설정
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1. 게시판(boards) 테이블 생성
CREATE TABLE boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE, -- 기업명 (중복 방지)
  description TEXT, -- 게시판 설명
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  post_count INTEGER DEFAULT 0, -- 게시글 수 (캐시용)
  is_active BOOLEAN DEFAULT true -- 게시판 활성화 상태
);

-- 2. 게시글(posts) 테이블 생성
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false
);

-- 3. 댓글(comments) 테이블 생성
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  like_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false
);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_boards_name ON boards(name);
CREATE INDEX idx_boards_created_at ON boards(created_at DESC);
CREATE INDEX idx_posts_board_id ON posts(board_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);

-- 5. RLS (Row Level Security) 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 프로필 정책: 모든 사용자가 조회 가능, 본인만 수정 가능
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 게시판 정책: 모든 사용자가 조회 가능, 로그인한 사용자만 생성 가능
CREATE POLICY "Anyone can view boards" ON boards FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create boards" ON boards FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Board creators can update their boards" ON boards FOR UPDATE USING (auth.uid() = creator_id);

-- 게시글 정책: 모든 사용자가 조회 가능, 로그인한 사용자만 생성 가능
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Post authors can update their posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Post authors can delete their posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- 댓글 정책
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (NOT is_deleted);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Comment authors can update their comments" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Comment authors can delete their comments" ON comments FOR DELETE USING (auth.uid() = author_id);

-- 6. 트리거 함수 생성 (게시글 수 자동 업데이트)
CREATE OR REPLACE FUNCTION update_board_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE boards SET post_count = post_count + 1 WHERE id = NEW.board_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE boards SET post_count = post_count - 1 WHERE id = OLD.board_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 트리거 생성
CREATE TRIGGER trigger_update_board_post_count_insert
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_board_post_count();

CREATE TRIGGER trigger_update_board_post_count_delete
  AFTER DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_board_post_count();

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 완료 메시지
SELECT 'Database schema created successfully!' as message;