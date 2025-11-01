-- Supabase SQL Editor에서 실행하세요
-- 목적: 좋아요/취소 토글을 한 번의 호출로 처리하고 최신 like_count 반환
SET search_path TO public;

CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id uuid)
RETURNS TABLE (status text, like_count integer)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_exists boolean;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.post_likes WHERE post_id = p_post_id AND user_id = v_user;
    status := 'unliked';
  ELSE
    INSERT INTO public.post_likes (post_id, user_id) VALUES (p_post_id, v_user)
    ON CONFLICT DO NOTHING;
    status := 'liked';
  END IF;

  SELECT like_count INTO like_count FROM public.posts WHERE id = p_post_id;
  RETURN NEXT;
END;
$$;

-- 확인 메시지
SELECT 'toggle_post_like RPC created' AS result;