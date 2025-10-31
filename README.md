# YumYum Order Management System

> 냠냠픽업 주문 접수 시스템 - Windows & macOS 데스크탑 애플리케이션

## 🚀 빠른 시작

### 개발 환경 실행
```bash
# 의존성 설치
npm install

# Electron 앱 실행
npm run electron

# 개발 모드 (nodemon)
npm run dev
```

## 📦 설치 패키지 빌드

### Windows
```bash
# 64비트 (권장)
npm run build:win

# 32비트
npm run build:win32

# 결과물
# dist/YumYum 주문접수-Setup-1.0.0-x64.exe
# dist/YumYum 주문접수-Portable-1.0.0-x64.exe
```

### macOS
```bash
# Apple Silicon (M1/M2/M3)
npm run build:mac-arm

# Intel Mac
npm run build:mac-intel

# Universal (Intel + Apple Silicon)
npm run build:mac

# 결과물
# dist/YumYum 주문접수-1.0.0-arm64.dmg
# dist/YumYum 주문접수-1.0.0-x64.dmg
```

### 모든 플랫폼
```bash
npm run build:all
```

## 🛠️ 프로젝트 구조

```
yumyum_order/
├── src/                    # Node.js 백엔드
│   ├── main-simple.js     # Electron 메인 프로세스
│   └── index.js           # 서버 엔트리포인트
├── renderer/              # 프론트엔드 (HTML/CSS/JS)
│   ├── order-management.html
│   ├── order-management.css
│   ├── order-management.js
│   ├── order-history.html
│   ├── settings.html
│   └── ...
├── assets/               # 아이콘 및 리소스
│   ├── icon.ico         # Windows 아이콘
│   ├── icon.icns        # macOS 아이콘
│   └── icon.png         # Linux 아이콘
├── dist/                # 빌드 결과물
├── package.json
└── README.md
```

## ✨ 주요 기능

- ✅ 실시간 주문 접수
- ✅ 주문 상태 관리 (신규/진행/완료)
- ✅ 타이머 카운팅 (원형 프로그레스 바)
- ✅ 프린터 자동 출력
- ✅ 주문 내역 조회
- ✅ 설정 관리 (운영/프린터/알림)
- ✅ 자동 접수 기능
- ✅ 알림음 및 볼륨 조절
- ✅ 다크/라이트 테마

## 📋 시스템 요구사항

### Windows
- Windows 10 이상
- 최소 4GB RAM
- 200MB 디스크 공간

### macOS
- macOS 10.13 (High Sierra) 이상
- Intel 또는 Apple Silicon
- 최소 4GB RAM
- 200MB 디스크 공간

## 🔧 개발 스크립트

```bash
# 서버 실행
npm start

# 서버 개발 모드 (자동 재시작)
npm run dev

# Electron 앱 실행
npm run electron

# 테스트
npm test
npm run test:watch

# 코드 린트
npm run lint
npm run lint:fix

# 코드 포맷팅
npm run format

# 빌드 (디렉토리만)
npm run pack
```

## 📝 설치 가이드

자세한 설치 방법은 [INSTALL.md](./INSTALL.md) 문서를 참고하세요.

## 🔄 업데이트 로그

자세한 변경 사항은 [CHANGELOG.md](./CHANGELOG.md) 문서를 참고하세요.

## 🐛 문제 해결

### Windows "PC 보호" 메시지
디지털 서명이 없어 나타나는 메시지입니다.
"추가 정보" → "실행" 클릭

### macOS "손상된 앱" 메시지
터미널에서 다음 명령어 실행:
```bash
sudo xattr -cr /Applications/YumYum\ 주문접수.app
```

### 프린터 인식 안됨
1. 프린터 드라이버 설치 확인
2. 설정에서 프린터 재선택
3. USB 연결 확인

## 📞 지원

- 이메일: support@yumyum.com
- 문서: [INSTALL.md](./INSTALL.md)

## 📄 라이선스

MIT License

Copyright (c) 2025 DoWon Jung

## 🙏 기여

버그 리포트, 기능 제안 등은 GitHub Issues를 통해 제출해주세요.

---

**Made with ❤️ by DoWon Jung**
