# Supabase 환경 변수 설정 가이드

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zahxirugcbwxckyeieuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphaHhpcnVnY2J3eGNreWVpZXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTEwOTQsImV4cCI6MjA1MTIyNzA5NH0.v66vHthj4D0pCHnJIDyD9_lO3z0R4Yp8g5p2bS0P-pI
```

## 파일 생성 방법

### Windows (PowerShell):
```powershell
cd c:\Users\taeah\OneDrive\Desktop\BetterLife
New-Item -Path .env.local -ItemType File
notepad .env.local
```

위 내용을 복사하여 붙여넣고 저장하세요.

### VS Code:
1. 프로젝트 루트에서 새 파일 생성
2. 파일명: `.env.local`
3. 위 내용 붙여넣기
4. 저장

## Vercel 환경 변수 설정

Vercel 대시보드에서도 환경 변수를 추가해야 합니다:

1. https://vercel.com/taes-projects-508e8308/betterlife/settings/environment-variables
2. 다음 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://zahxirugcbwxckyeieuz.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphaHhpcnVnY2J3eGNreWVpZXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NTEwOTQsImV4cCI6MjA1MTIyNzA5NH0.v66vHthj4D0pCHnJIDyD9_lO3z0R4Yp8g5p2bS0P-pI`
3. Environment: Production, Preview, Development 모두 선택
4. Save
