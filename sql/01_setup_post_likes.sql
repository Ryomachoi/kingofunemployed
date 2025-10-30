-- Supabase SQL Editor에서 실행하세요
-- 목적: 게시글 좋아요(post_likes) 시스템 안전 설정 + like_count 백필
SET search_path TO public;

-- 1) posts.like_count 컬럼 보강 (없으면 추가)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- 2) post_likes 테이블 생성(없으면)
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT post_likes_unique UNIQUE (post_id, user_id)
);

-- 3) 인덱스 생성(있으면 건너뜀)
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_like_count ON public.posts(like_count DESC);

-- 4) 좋아요 카운트 트리거 함수 생성/갱신
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5) 트리거 중복 방지 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_post_like_count_trigger'
  ) THEN
    CREATE TRIGGER update_post_like_count_trigger
      AFTER INSERT OR DELETE ON public.post_likes
      FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();
  END IF;
END $$;

-- 6) RLS 활성화 및 정책 재정의(중복 제거 후 재생성)
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'post_likes') THEN
    DROP POLICY IF EXISTS "Users can view post likes" ON public.post_likes;
    DROP POLICY IF EXISTS "Authenticated users can manage their post likes" ON public.post_likes;
  END IF;
END $$;

CREATE POLICY "Users can view post likes" ON public.post_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their post likes" ON public.post_likes
  FOR ALL USING (auth.uid() = user_id);

-- 7) 기존 데이터로 like_count 백필(있을 때만)
UPDATE public.posts p
SET like_count = COALESCE(s.cnt, 0)
FROM (
  SELECT post_id, COUNT(*) AS cnt
  FROM public.post_likes
  GROUP BY post_id
) s
WHERE p.id = s.post_id;

-- 확인 메시지
SELECT 'post_likes setup + like_count backfill completed' AS result;