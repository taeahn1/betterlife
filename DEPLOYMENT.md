# Vercel 배포 가이드

BetterLife 앱을 Vercel에 배포하는 방법입니다.

## 방법 1: Vercel 웹 인터페이스 (권장)

### 1단계: GitHub에 코드 업로드

먼저 GitHub에 새 저장소를 만들고 코드를 푸시합니다:

1. GitHub에서 새 저장소 생성: https://github.com/new
   - Repository name: `betterlife`
   - Public 또는 Private 선택
   - **Initialize this repository with a README 체크 해제**

2. 로컬에서 GitHub 저장소 연결:
```bash
cd c:\Users\taeah\OneDrive\Desktop\BetterLife
git remote add origin https://github.com/YOUR_USERNAME/betterlife.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 임포트

1. https://vercel.com 접속 및 로그인
2. "Add New..." → "Project" 클릭
3. "Import Git Repository" 섹션에서 GitHub 계정 연결
4. `betterlife` 저장소 선택
5. "Import" 클릭

### 3단계: 프로젝트 설정

Vercel이 자동으로 Next.js 프로젝트를 감지합니다:

- **Framework Preset**: Next.js (자동 감지됨)
- **Build Command**: `next build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

환경 변수는 현재 필요 없습니다 (JSON 파일 기반 DB 사용 중).

### 4단계: 배포

"Deploy" 버튼을 클릭하면 자동으로 배포가 시작됩니다.

배포 완료 후:
- Production URL: `https://betterlife-xxx.vercel.app`
- 자동 HTTPS 적용
- 글로벌 CDN 배포

---

## 방법 2: Vercel CLI (대안)

CLI 인증 문제가 있는 경우, 토큰을 직접 생성할 수 있습니다:

### 1단계: Vercel 토큰 생성

1. https://vercel.com/account/tokens 접속
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: "BetterLife Deployment")
4. 생성된 토큰 복사

### 2단계: 토큰으로 로그인

```bash
vercel login --token YOUR_TOKEN_HERE
```

### 3단계: 배포

```bash
cd c:\Users\taeah\OneDrive\Desktop\BetterLife
vercel --prod
```

---

## 배포 후 확인사항

### 1. API 엔드포인트 테스트

배포된 URL로 API 테스트:

```bash
# 명상 기록 추가
Invoke-WebRequest -Uri "https://your-app.vercel.app/api/log" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"user_id":"test","action":"meditation_start","timestamp":"2025-12-31T12:00:00+09:00"}'

# 이벤트 조회
Invoke-WebRequest -Uri "https://your-app.vercel.app/api/events"
```

### 2. 대시보드 확인

브라우저에서 `https://your-app.vercel.app` 접속하여 UI 확인

### 3. iPhone 단축어 업데이트

단축어의 URL을 로컬 주소에서 Vercel URL로 변경:
- Before: `http://localhost:3000/api/log`
- After: `https://your-app.vercel.app/api/log`

---

## 주의사항

### 데이터 지속성

현재 JSON 파일 기반 데이터베이스는 **Vercel의 서버리스 환경에서 작동하지 않습니다**.

Vercel은 각 요청마다 새로운 서버리스 함수 인스턴스를 생성하므로, 파일 시스템에 저장된 데이터가 유지되지 않습니다.

**해결 방법:**

#### 옵션 1: Vercel KV (Redis) 사용

```bash
# Vercel 프로젝트에서 KV 스토어 추가
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
```

`lib/db.ts`를 Vercel KV로 변경 필요

#### 옵션 2: Supabase 사용 (권장)

1. https://supabase.com 에서 프로젝트 생성
2. 테이블 생성:
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. Vercel 환경 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. `lib/db.ts` 수정하여 Supabase 클라이언트 사용

#### 옵션 3: Vercel Postgres

Vercel의 Postgres 데이터베이스 사용 (유료)

---

## 다음 단계

1. **즉시 배포 가능**: Vercel 웹 인터페이스로 배포 (UI만 확인 가능)
2. **데이터 지속성 필요**: Supabase 또는 Vercel KV 연동 후 배포

어떤 방법으로 진행하시겠습니까?
