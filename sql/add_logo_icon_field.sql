-- 게시판 테이블에 logo_icon 필드 추가
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- logo_icon 컬럼 추가 (이미지와 아이콘 모두 지원)
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS logo_icon VARCHAR(10);

-- 완료 메시지
SELECT 'boards 테이블에 logo_icon 필드가 추가되었습니다.' as message;