-- 게시판 테이블에 이미지 필드 추가 및 로고 아이콘 필드 제거
-- 이 스크립트는 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 새로운 이미지 URL 필드 추가
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS logo_image_url TEXT,
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

-- 2. 기존 logo_icon 필드 제거 (존재하는 경우)
ALTER TABLE boards 
DROP COLUMN IF EXISTS logo_icon;

-- 3. 성능 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_boards_logo_image_url ON boards(logo_image_url);
CREATE INDEX IF NOT EXISTS idx_boards_banner_image_url ON boards(banner_image_url);

-- 완료 메시지
SELECT 'boards 테이블에 이미지 필드가 추가되고 logo_icon 필드가 제거되었습니다.' as message;