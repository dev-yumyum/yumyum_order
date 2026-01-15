# YumYum Order - 웹 버전 빠른 시작 가이드

## 🚀 즉시 Vercel에 배포하기

### 방법 1: Vercel CLI로 배포 (가장 빠름)

1. **Vercel 로그인**
   ```bash
   vercel login
   ```
   - 이메일 주소 입력
   - 이메일로 전송된 확인 링크 클릭

2. **프로젝트 배포**
   ```bash
   cd /Users/dowon_mac/Desktop/도원프로젝트/yumyum_order
   vercel --prod
   ```
   - 프로젝트 이름 확인 (Enter)
   - 프로젝트 디렉토리 확인 (Enter)
   - 몇 초 후 배포 완료!
   - 배포된 URL이 표시됩니다 (예: `https://yumyum-order.vercel.app`)

3. **배포 완료!**
   - 표시된 URL로 접속하여 바로 사용 가능

### 방법 2: GitHub 연동 (자동 배포)

1. **GitHub에 코드 푸시**
   ```bash
   cd /Users/dowon_mac/Desktop/도원프로젝트/yumyum_order
   git add .
   git commit -m "웹 버전 배포 준비"
   git push origin main
   ```

2. **Vercel에서 임포트**
   - https://vercel.com/new 접속
   - GitHub 저장소 선택
   - "Import" 클릭
   - "Deploy" 클릭
   - 완료!

3. **자동 배포 설정 완료**
   - 이후 GitHub에 push하면 자동으로 Vercel에 배포됩니다

## 🖥️ 로컬에서 웹 버전 테스트

Vercel 배포 전 로컬에서 테스트하려면:

```bash
cd /Users/dowon_mac/Desktop/도원프로젝트/yumyum_order
npm run web:dev
```

브라우저에서 `http://localhost:3000`이 자동으로 열립니다.

## ✅ 배포 확인 사항

배포가 완료되면 다음을 확인하세요:

### 1. 로그인 테스트
- 배포된 URL 접속
- 로그인 화면이 나타나는지 확인
- 초기 아이디/비밀번호로 로그인 (코드에서 설정한 값)

### 2. 주문 접수 테스트
- 새 주문 접수
- 주문 내역 확인
- 주문 상태 변경

### 3. 데이터 저장 확인
- 주문 등록 후 페이지 새로고침
- 데이터가 유지되는지 확인 (localStorage 사용)

## 🔧 배포 후 설정

### 커스텀 도메인 연결
1. Vercel Dashboard → 프로젝트 선택
2. Settings → Domains
3. Add Domain → 도메인 입력
4. DNS 설정 안내 따라 진행

### 환경 변수 설정 (백엔드 API 사용 시)
1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. 다음 변수 추가:
   - `API_URL`: 백엔드 API 서버 URL
   - `API_KEY`: API 인증 키

## 📱 모바일에서 사용

배포된 URL을 모바일 브라우저에서 열면:
- 반응형 디자인으로 모바일에 최적화됨
- 홈 화면에 추가 가능
- PWA 기능 지원 (향후 업데이트)

## ⚠️ 주의사항

1. **데이터 저장**
   - 기본적으로 브라우저 localStorage 사용
   - 브라우저 캐시 삭제 시 데이터 손실 가능
   - 중요한 데이터는 백엔드 API 연동 권장

2. **프린터 기능**
   - 웹에서는 브라우저 인쇄 대화상자 사용
   - Electron 버전에서만 직접 프린터 연결 지원

3. **보안**
   - Vercel은 자동으로 HTTPS 제공
   - 프로덕션 사용 시 인증 시스템 강화 권장

## 🆘 문제 해결

### 배포 실패
```bash
# 로그 확인
vercel logs

# 재배포
vercel --prod --force
```

### 페이지가 표시되지 않음
- `vercel.json` 설정 확인
- `public/index.html` 파일 존재 확인
- 브라우저 콘솔(F12)에서 에러 확인

### 데이터가 저장되지 않음
- 브라우저 개발자 도구(F12) → Application → Local Storage 확인
- 브라우저 설정에서 쿠키/로컬 스토리지 허용 확인

## 📚 추가 문서

- 상세 배포 가이드: `WEB_DEPLOY.md`
- 백엔드 연동: `BACKEND_SETUP.md`
- 전체 문서: `README.md`

## 🎉 완료!

이제 YumYum 주문 접수 시스템을 웹에서 사용할 수 있습니다!
- 어디서든 브라우저로 접속
- 데스크톱과 모바일 모두 지원
- 실시간 주문 관리

질문이나 문제가 있으면 이슈를 등록해주세요.
