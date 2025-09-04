-- AI 피드백과 면접 후기 통합을 위한 데이터베이스 스키마 수정
-- 1단계: interviews 테이블 스키마 업데이트
-- Supabase SQL Editor에서 순서대로 실행하세요

-- 1. 현재 interviews 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'interviews'
ORDER BY ordinal_position;

-- 2. 기존 ai_feedback 컬럼의 데이터 타입 확인
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'interviews'
AND column_name = 'ai_feedback';

-- 3. ai_feedback 컬럼을 TEXT에서 JSONB로 변경
-- 기존 TEXT 데이터가 있는 경우를 고려한 안전한 변경
DO $$
BEGIN
    -- 임시 컬럼 생성
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'interviews' 
        AND column_name = 'ai_feedback_temp'
    ) THEN
        ALTER TABLE interviews ADD COLUMN ai_feedback_temp JSONB;
        
        -- 기존 TEXT 데이터를 JSONB로 변환 (가능한 경우)
        UPDATE interviews 
        SET ai_feedback_temp = 
            CASE 
                WHEN ai_feedback IS NULL THEN NULL
                WHEN ai_feedback = '' THEN NULL
                WHEN ai_feedback::text ~ '^\s*[{\[]' THEN 
                    -- JSON 형태로 보이는 경우 파싱 시도
                    CASE 
                        WHEN ai_feedback::text::jsonb IS NOT NULL THEN ai_feedback::text::jsonb
                        ELSE jsonb_build_object('legacy_feedback', ai_feedback)
                    END
                ELSE 
                    -- 일반 텍스트인 경우 객체로 래핑
                    jsonb_build_object('legacy_feedback', ai_feedback)
            END
        WHERE ai_feedback IS NOT NULL AND ai_feedback != '';
        
        -- 기존 컬럼 삭제 및 임시 컬럼을 원래 이름으로 변경
        ALTER TABLE interviews DROP COLUMN IF EXISTS ai_feedback;
        ALTER TABLE interviews RENAME COLUMN ai_feedback_temp TO ai_feedback;
        
        RAISE NOTICE 'ai_feedback 컬럼이 JSONB로 성공적으로 변경되었습니다.';
    ELSE
        RAISE NOTICE 'ai_feedback_temp 컬럼이 이미 존재합니다. 수동으로 확인해주세요.';
    END IF;
END
$$;

-- 4. AI 분석 메타데이터를 위한 컬럼 추가
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS ai_analysis_metadata JSONB;

-- 5. 분석 완료 시간을 위한 컬럼 추가
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS analysis_timestamp TIMESTAMP WITH TIME ZONE;

-- 6. AI 분석 상태를 위한 컬럼 추가 (pending, processing, completed, failed)
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS ai_analysis_status VARCHAR(20) DEFAULT 'pending';

-- 7. AI 분석 상태에 대한 CHECK 제약 조건 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'interviews_ai_analysis_status_check'
    ) THEN
        ALTER TABLE interviews ADD CONSTRAINT interviews_ai_analysis_status_check 
        CHECK (ai_analysis_status IN ('pending', 'processing', 'completed', 'failed'));
        RAISE NOTICE 'AI 분석 상태 제약 조건이 추가되었습니다.';
    END IF;
END
$$;

-- 8. 성능 최적화를 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_interviews_ai_analysis_status ON interviews(ai_analysis_status);
CREATE INDEX IF NOT EXISTS idx_interviews_analysis_timestamp ON interviews(analysis_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_ai_feedback_gin ON interviews USING GIN(ai_feedback);

-- 9. 업데이트된 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'interviews'
ORDER BY ordinal_position;

-- 10. 새로 추가된 컬럼들 확인
SELECT 
    'ai_feedback' as column_name,
    data_type,
    'AI 분석 결과 (JSONB 형태)' as description
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'interviews'
AND column_name = 'ai_feedback'

UNION ALL

SELECT 
    'ai_analysis_metadata' as column_name,
    data_type,
    'AI 분석 메타데이터 (프롬프트 ID, 버전, 토큰 사용량 등)' as description
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'interviews'
AND column_name = 'ai_analysis_metadata'

UNION ALL

SELECT 
    'analysis_timestamp' as column_name,
    data_type,
    'AI 분석 완료 시간' as description
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'interviews'
AND column_name = 'analysis_timestamp'

UNION ALL

SELECT 
    'ai_analysis_status' as column_name,
    data_type,
    'AI 분석 상태 (pending, processing, completed, failed)' as description
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'interviews'
AND column_name = 'ai_analysis_status';

-- 11. 제약 조건 확인
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c 
JOIN pg_namespace n ON n.oid = c.connamespace 
WHERE contype = 'c' 
AND conrelid = 'interviews'::regclass
AND conname LIKE '%ai_analysis%';

SELECT '✅ 1단계: 데이터베이스 스키마 수정이 완료되었습니다!' as result;