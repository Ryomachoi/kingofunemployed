-- Supabase SQL Editor에서 실행하세요.
-- 목적: post_likes 테이블 RLS 정책을 보강하여 사용자가 자신의 좋아요만 생성/삭제 가능하도록 합니다.

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'post_likes'
  ) THEN
    -- 기존 정책 제거(존재할 경우)
    DROP POLICY IF EXISTS "Users can view post likes" ON public.post_likes;
    DROP POLICY IF EXISTS "Authenticated users can manage their post likes" ON public.post_likes;
    DROP POLICY IF EXISTS "select post likes" ON public.post_likes;
    DROP POLICY IF EXISTS "insert own post likes" ON public.post_likes;
    DROP POLICY IF EXISTS "delete own post likes" ON public.post_likes;
  END IF;
END $$;

-- 조회는 모두 허용
CREATE POLICY "select post likes" ON public.post_likes
  FOR SELECT USING (true);

-- 본인 행만 생성 허용
CREATE POLICY "insert own post likes" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 행만 삭제 허용
CREATE POLICY "delete own post likes" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 확인 메시지
SELECT 'post_likes RLS policies fixed (select/insert/delete)' AS result;