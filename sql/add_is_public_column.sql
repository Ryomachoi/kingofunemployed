-- interviews 테이블에 is_public 컬럼 추가
-- 면접 후기 공개 여부를 저장하는 컬럼

ALTER TABLE interviews 
ADD COLUMN is_public BOOLEAN DEFAULT false;

-- 기존 데이터에 대해 기본값 설정 (모두 비공개로 설정)
UPDATE interviews 
SET is_public = false 
WHERE is_public IS NULL;

-- 컬럼에 NOT NULL 제약 조건 추가
ALTER TABLE interviews 
ALTER COLUMN is_public SET NOT NULL;

-- 인덱스 추가 (공개된 면접 후기 조회 성능 향상)
CREATE INDEX idx_interviews_is_public ON interviews(is_public);
CREATE INDEX idx_interviews_is_public_created_at ON interviews(is_public, created_at DESC);

-- 확인 쿼리
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'interviews' 
AND column_name = 'is_public';

-- 테스트 쿼리 (공개된 면접 후기만 조회)
-- SELECT * FROM interviews WHERE is_public = true ORDER BY created_at DESC;