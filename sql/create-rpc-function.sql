-- 조회수 증가를 위한 RPC 함수 생성
CREATE OR REPLACE FUNCTION increment_post_view_count(post_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_view_count INTEGER;
BEGIN
    -- 게시물이 존재하고 삭제되지 않았는지 확인
    IF NOT EXISTS (
        SELECT 1 FROM posts 
        WHERE id = post_id AND is_deleted = false
    ) THEN
        RETURN 0;
    END IF;
    
    -- 조회수 증가 및 새로운 값 반환
    UPDATE posts 
    SET view_count = COALESCE(view_count, 0) + 1,
        updated_at = NOW()
    WHERE id = post_id AND is_deleted = false
    RETURNING view_count INTO new_view_count;
    
    RETURN COALESCE(new_view_count, 0);
END;
$$;