# SQL 스크립트 실행 순서

현재 발생한 오류들을 해결하기 위한 올바른 SQL 스크립트 실행 순서입니다.

## 문제 분석

`ERROR: 42703: column i.is_public does not exist` 오류가 발생하는 이유:
- `cleanup_old_qa_structure.sql`의 함수들이 `is_public`, `is_shared` 컬럼을 참조
- 하지만 이 컬럼들이 실제로는 interviews 테이블에 추가되지 않음
- 함수가 존재하지 않는 컬럼을 참조하려고 해서 오류 발생

## 올바른 실행 순서

### 1단계: AI 피드백 스키마 통합 (선택사항)
```sql
-- 파일: integrate_ai_feedback_schema.sql
-- AI 피드백 관련 컬럼들을 추가하고 JSONB로 변환
```

### 2단계: 면접 질문 테이블 생성 및 마이그레이션
```sql
-- 파일: create_interview_questions_table_fixed.sql
-- interview_questions 테이블 생성 및 기존 데이터 마이그레이션
```

### 3단계: 공개/공유 컬럼 추가 (필요한 경우)
```sql
-- 파일: add_is_public_column.sql
-- is_public 컬럼 추가

-- 파일: add_is_shared_column.sql  
-- is_shared 컬럼 추가
```

### 4단계: 정리 및 함수 생성
```sql
-- 파일: cleanup_old_qa_structure.sql (수정된 버전)
-- 기존 구조 정리 및 새로운 조회 함수 생성
```

## 현재 상황에서의 해결책

현재 `cleanup_old_qa_structure.sql`은 이미 수정되어 `is_public`, `is_shared` 컬럼 참조를 제거했습니다.
따라서 바로 실행 가능합니다.

만약 나중에 공개/공유 기능이 필요하다면:
1. `add_is_public_column.sql` 실행
2. `add_is_shared_column.sql` 실행  
3. `cleanup_old_qa_structure.sql`의 함수들을 다시 수정하여 해당 컬럼들 참조 추가

## 각 SQL 파일의 목적

- **integrate_ai_feedback_schema.sql**: AI 피드백 시스템 통합
- **create_interview_questions_table_fixed.sql**: JSONB에서 정규화된 테이블 구조로 마이그레이션
- **cleanup_old_qa_structure.sql**: 마이그레이션 후 정리 작업 및 새로운 조회 함수 생성
- **add_is_public_column.sql**: 면접 후기 공개 기능 추가
- **add_is_shared_column.sql**: 면접 후기 공유 기능 추가

## 주의사항

1. 각 단계별로 실행 후 오류 확인
2. 데이터 백업 권장
3. 프로덕션 환경에서는 트랜잭션 사용 권장
4. 컬럼 추가 전에 해당 컬럼을 참조하는 함수 실행 금지