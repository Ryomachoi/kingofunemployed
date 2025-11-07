# 킹오브실업자 (King of Unemployed)

면접 후기 공유 및 AI 피드백 서비스. Supabase 인증/DB와 OpenAI Responses API를 사용합니다.

## 🚀 빠른 시작(Windows)

1) 의존성 설치

```powershell
npm install
```

2) 환경 변수 파일 생성

```powershell
# 예시 파일을 로컬 환경 파일로 복사
Copy-Item .env.example .env.local

# .env.local 파일을 열어 실제 값으로 수정하세요
```

3) 개발 서버 실행

```powershell
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 동작을 확인하세요.

## 📋 필수 준비물

- Node.js 18 이상(권장: 20 이상)
- Git
- Supabase 프로젝트 및 데이터베이스
- OpenAI 계정과 API 키(Responses API 사용)

## 🔑 환경 변수(.env.local)

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon 키(클라이언트용)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 롤 키(서버 전용, 커밋 금지)
- `NEXT_PUBLIC_SITE_URL`: 사이트 기본 URL(로컬: `http://localhost:3000`)
- `NEXT_PUBLIC_NAVER_CLIENT_ID`: 네이버 OAuth Client ID
- `NEXT_PUBLIC_NAVER_CLIENT_SECRET`: 네이버 OAuth Client Secret
- `OPENAI_API_KEY`: OpenAI API 키(면접 AI 분석용)
- `OPENAI_PROMPT_ID`: OpenAI Responses Prompt ID(콘솔에서 생성한 프롬프트 ID)
- `OPENAI_PROMPT_VERSION`: 프롬프트 버전(기본값 8)

예시 값은 `.env.example`에 모두 포함되어 있습니다. 이 파일을 복사해서 사용하세요.

보안 주의: 현재 코드가 네이버 `CLIENT_SECRET`에 `NEXT_PUBLIC_` 접두사를 사용합니다. 운영 환경에서는 공개 접두사 없이 서버 전용 변수로의 전환을 권장합니다.

## 🗄️ Supabase 데이터베이스 설정(필수)

Supabase 대시보드 → SQL Editor에서 아래 스크립트를 순서대로 실행하세요:

- `sql/fix_interviews_foreign_key.sql`
  - `interviews` 테이블과 `user_profiles` 테이블 생성 및 기본 RLS 정책 설정
- `sql/integrate_ai_feedback_schema.sql`
  - `interviews.ai_feedback`를 JSONB로 변환, 메타데이터/상태/타임스탬프 컬럼 추가
- `sql/add_is_shared_column.sql`
  - 커뮤니티 공유 플래그 `is_shared` 추가 및 인덱스 생성
- 권장: `sql/fix_interview_type_constraint.sql`, `sql/fix_difficulty_constraint.sql`
  - 면접 타입/난이도 값 제약 조건을 프로젝트 데이터에 맞게 정비

게시판/댓글/추천 기능을 사용하려면 다음 스키마를 추가로 실행하세요:

- 새 프로젝트(데이터 없음): `sql/create_boards_system.sql` (기존 테이블 제거 후 전체 생성)
- 기존 데이터 유지가 필요하면 `sql/01_setup_post_likes.sql` 등 부분 스크립트를 참고해 단계별 적용

## 🔐 인증 및 OAuth 설정

- 카카오 로그인: Supabase Authentication에서 Kakao Provider를 활성화하고 키를 설정하세요.
- 네이버 로그인: 네이버 개발자 센터에서 애플리케이션을 등록하고 아래를 설정하세요.
  - Client ID/Secret: `.env.local`에 입력
  - Callback URL: `http://localhost:3000/api/auth/naver/callback`
  - `.env.local`의 `NEXT_PUBLIC_SITE_URL`은 로컬에서 `http://localhost:3000`으로 설정

## 🧪 동작 확인 체크리스트

- 홈/로그인 페이지 접근: `http://localhost:3000`, `http://localhost:3000/login`
- 회원가입/로그인 후 마이페이지 접근: `http://localhost:3000/mypage`
- 면접 분석 페이지(OpenAI): `http://localhost:3000/interview/analyze`에서 분석 실행
- 커뮤니티 공유: 면접 상세에서 공유 시 `is_shared`가 `true`로 업데이트되는지 확인

## 🧰 문제 해결(Windows)

- 환경 변수 파일 확인: `.env.local`가 존재하고 위 키들이 모두 채워져 있는지 확인
- 의존성 재설치:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

- Next.js 캐시 정리: `.next` 폴더 삭제 후 다시 실행
- 포트 충돌 해결: `./fix-common-issues.ps1` 실행(포트 사용 중인 프로세스 종료/캐시 정리/재설치)
- Node.js 버전 확인: PowerShell에서 `node --version` (18 이상 권장, 20 추천)

## 🛠️ 자동 설정 스크립트

- 초기 설정: `./setup-project.ps1`
  - Node 버전 확인, 의존성 설치, `.env.example` → `.env.local` 복사, 캐시 정리
- 문제 해결: `./fix-common-issues.ps1`
  - 포트 충돌 해결/캐시 정리/의존성 재설치/환경 변수 확인

## 🚢 배포

- 프로덕션 빌드: `npm run build`
- 시작: `npm start`
- Vercel 배포 문서: https://nextjs.org/docs/app/building-your-application/deploying

## 참고 링크

- Next.js 문서: https://nextjs.org/docs
- Supabase 문서: https://supabase.com/docs
- OpenAI Responses API: https://platform.openai.com/docs/guides/responses