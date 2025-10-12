# 킹오브실업자 (King of Unemployed)

면접 후기 공유 및 AI 피드백 서비스

## 🚀 프로젝트 설정 및 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
# .env.example 파일을 .env.local로 복사
cp .env.example .env.local

# .env.local 파일을 열어서 실제 값으로 수정
```

**필수 환경 변수:**
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `OPENAI_API_KEY`: OpenAI API 키 (면접 분석 기능용)

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 🔧 문제 해결

### 프로젝트가 실행되지 않는 경우:
1. **환경 변수 확인**: `.env.local` 파일이 존재하고 모든 필수 값이 설정되어 있는지 확인
2. **의존성 재설치**: `rm -rf node_modules package-lock.json && npm install`
3. **캐시 정리**: `npm run dev -- --reset-cache` 또는 `.next` 폴더 삭제
4. **Node.js 버전**: Node.js 18 이상 사용 권장

### 데이터베이스 설정:
- Supabase 프로젝트에서 `sql/` 폴더의 스키마 파일들을 실행해야 합니다
- 특히 `create_user_profiles.sql`, `integrate_ai_feedback_schema.sql` 등이 필요합니다

## 🛠️ 자동 설정 스크립트

### 처음 프로젝트를 설정하는 경우:
```powershell
.\setup-project.ps1
```

### 프로젝트 실행 중 문제가 발생한 경우:
```powershell
.\fix-common-issues.ps1
```

이 스크립트들은 다음 작업을 자동으로 수행합니다:
- 의존성 설치/재설치
- 환경 변수 파일 생성
- 캐시 정리
- 포트 충돌 해결
- 필수 환경 변수 확인

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# kingofunemployed
# kingofunemployed
# kingofunemployed
# kingofunemployed
# kingofunemployed
# kingofunemployed
# kingofunemployed
# kingofunemployed
# Test commit for credential setup
