# YumYum Order - 웹 버전 배포 가이드

## 개요
YumYum 주문 접수 시스템을 웹 애플리케이션으로도 사용할 수 있습니다.
Electron 데스크톱 애플리케이션과 웹 브라우저 모두에서 실행 가능합니다.

## 웹 버전 특징

### 호환성
- **Electron 환경**: 모든 기능 지원 (프린터, 시리얼 포트, 파일 시스템 등)
- **웹 브라우저 환경**: 
  - localStorage 기반 데이터 저장
  - 브라우저 알림 API 사용
  - 브라우저 인쇄 기능 사용
  - 백엔드 API 연동 가능

### 지원 브라우저
- Chrome/Edge (권장)
- Firefox
- Safari
- 모바일 브라우저 (반응형 지원)

## 로컬 개발 환경

### 1. 의존성 설치
```bash
npm install
```

### 2. 웹 서버 실행
```bash
# 개발 모드 (캐시 비활성화)
npm run web:dev

# 프로덕션 모드
npm run web
```

브라우저에서 자동으로 `http://localhost:3000`이 열립니다.

## Vercel 배포

### 사전 준비
1. [Vercel 계정](https://vercel.com) 생성
2. Vercel CLI 설치 (선택사항):
   ```bash
   npm install -g vercel
   ```

### 배포 방법 1: Vercel CLI 사용

1. **로그인**
   ```bash
   vercel login
   ```

2. **배포**
   ```bash
   # 테스트 배포
   vercel
   
   # 프로덕션 배포
   npm run vercel:deploy
   # 또는
   vercel --prod
   ```

3. **배포 완료**
   - 배포가 완료되면 URL이 표시됩니다 (예: `https://yumyum-order.vercel.app`)
   - 배포된 URL로 접속하여 확인

### 배포 방법 2: GitHub 연동 (권장)

1. **GitHub 저장소 생성**
   - GitHub에 저장소를 생성하고 코드를 푸시합니다
   ```bash
   git add .
   git commit -m "웹 버전 배포 준비"
   git push origin main
   ```

2. **Vercel에서 프로젝트 임포트**
   - [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
   - "New Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - Framework Preset: `Other` 선택
   - Build Command: 비워두기 (정적 사이트)
   - Output Directory: `.` (루트)
   - Install Command: `npm install` (기본값)

4. **배포**
   - "Deploy" 클릭
   - 배포 완료 후 URL 확인

5. **자동 배포**
   - 이후 GitHub에 push하면 자동으로 Vercel에 배포됩니다
   - main 브랜치 → 프로덕션 배포
   - 다른 브랜치 → 프리뷰 배포

## 환경 변수 설정

백엔드 API를 사용하는 경우 Vercel에서 환경 변수를 설정할 수 있습니다.

### Vercel Dashboard에서 설정
1. 프로젝트 선택
2. "Settings" → "Environment Variables"
3. 다음 변수 추가:
   - `API_URL`: 백엔드 API 서버 URL (예: `https://api.yumyum.com`)
   - `API_KEY`: API 인증 키 (선택사항)

### CLI로 설정
```bash
vercel env add API_URL
# 값 입력: https://api.yumyum.com

vercel env add API_KEY
# 값 입력: your-api-key
```

## 커스텀 도메인 설정

### Vercel에서 도메인 연결
1. Vercel Dashboard → 프로젝트 선택
2. "Settings" → "Domains"
3. "Add Domain" 클릭
4. 도메인 입력 (예: `order.yumyum.com`)
5. DNS 설정 안내에 따라 DNS 레코드 추가
6. 인증 완료 후 HTTPS 자동 적용

## 데이터 저장 방식

### 로컬 모드 (기본)
- 브라우저 localStorage에 데이터 저장
- 브라우저를 닫아도 데이터 유지
- 브라우저별로 독립적인 데이터
- 캐시/쿠키 삭제 시 데이터 손실 가능

### 백엔드 연동 모드
- Spring Boot 백엔드 API 서버 연동
- 여러 디바이스에서 데이터 공유
- 영구적인 데이터 저장
- `renderer/backend-config.js`에서 설정:
  ```javascript
  const BACKEND_CONFIG = {
      apiUrl: 'https://your-backend-api.com',
      localMode: false  // false로 설정하면 백엔드 사용
  };
  ```

## 기능 제한사항

웹 환경에서는 다음 기능이 제한됩니다:

| 기능 | Electron | 웹 브라우저 |
|------|----------|------------|
| 주문 관리 | ✅ | ✅ |
| 매출 통계 | ✅ | ✅ |
| 메뉴 관리 | ✅ | ✅ |
| 프린터 연결 | ✅ | ❌ (브라우저 인쇄만) |
| 영수증 인쇄 | ✅ 직접 인쇄 | ⚠️ 브라우저 인쇄 대화상자 |
| 시리얼 포트 | ✅ | ❌ |
| 시스템 알림 | ✅ | ✅ (권한 필요) |
| 오디오 알림 | ✅ | ✅ |
| 파일 시스템 | ✅ | ❌ |

## 보안 고려사항

### 프로덕션 배포 시
1. **HTTPS 사용** (Vercel은 자동으로 HTTPS 적용)
2. **API 키 보호** (환경 변수 사용)
3. **CORS 설정** (백엔드 API에서)
4. **인증/인가** 구현 권장

### 민감 정보 처리
- 고객 전화번호 마스킹 처리 (`010-****-5678`)
- localStorage에 민감 정보 저장 지양
- 백엔드 API 사용 권장

## 문제 해결

### 배포 실패
```bash
# 빌드 로그 확인
vercel logs [deployment-url]

# 재배포
vercel --prod --force
```

### API 연결 실패
- 브라우저 개발자 도구 (F12) → Console 탭 확인
- CORS 오류: 백엔드 API에서 CORS 헤더 설정 필요
- Network 탭에서 요청 상태 확인

### 알림이 작동하지 않음
- 브라우저 알림 권한 확인
- HTTPS 필수 (Vercel은 자동 제공)
- 브라우저 설정에서 알림 허용 확인

### 데이터가 사라짐 (로컬 모드)
- localStorage는 브라우저 캐시/쿠키 삭제 시 함께 삭제됨
- 백엔드 API 연동 권장
- 정기적으로 데이터 백업

## 추가 설정

### PWA (Progressive Web App) 변환
향후 PWA로 변환하면:
- 오프라인에서도 작동
- 홈 화면에 앱 아이콘 추가
- 푸시 알림 지원
- 네이티브 앱처럼 사용 가능

### 백엔드 API 개발
Spring Boot 백엔드 API 개발 가이드는 `BACKEND_SETUP.md` 참고

## 지원

문제가 발생하거나 질문이 있으면:
- GitHub Issues 등록
- 개발자 이메일 문의

## 라이선스
MIT License
