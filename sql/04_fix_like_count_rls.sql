-- Supabase SQL Editor에서 실행하세요.
-- 목적: 1) 좋아요 카운트 트리거가 RLS 정책을 우회하여 실행되도록 수정합니다.
--       2) posts 테이블의 변경사항이 실시간으로 반영되도록 Realtime 퍼블리케이션에 추가합니다.

-- 1. 트리거 함수에 SECURITY DEFINER 추가
-- 이 설정은 함수가 생성자(일반적으로 슈퍼유저)의 권한으로 실행되게 하여,
-- 어떤 사용자든 좋아요를 누를 때 posts.like_count를 안정적으로 업데이트할 수 있게 합니다.
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
-- 보안을 위해 함수 내에서 검색 경로를 명시적으로 설정합니다.
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- like_count가 0 미만으로 내려가지 않도록 방지합니다.
    UPDATE public.posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 2. Realtime 퍼블리케이션에 테이블 추가 (이미 추가된 경우 무시됨)
-- posts 테이블의 업데이트(예: like_count 변경)를 실시간으로 클라이언트에 전파합니다.
-- 참고: Supabase 대시보드의 Database > Replication 에서도 활성화할 수 있습니다.
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;

-- 확인 메시지
SELECT 'Like count trigger fixed and realtime publication for posts & post_likes updated.' AS result;